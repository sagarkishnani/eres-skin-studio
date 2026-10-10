(function ($) {
  "use strict";

  var settings = window.eresCheckout || {};

  function isDeliveryChosen() {
    var $chosen = $('input[name="shipping_method[0]"]:checked');
    return $chosen.length > 0 && String($chosen.val()).indexOf(settings.pickupMethod) !== 0;
  }

  function syncDeliveryAddress() {
    $("[data-eres-delivery-address]").prop("hidden", !isDeliveryChosen());
  }

  function showCouponMessage($coupon, noticesHtml) {
    var $notices = $("<div>").html(noticesHtml);
    var text = $.trim($notices.text());
    $coupon
      .find(".eres-coupon__message")
      .text(text)
      .toggleClass("eres-coupon__message--error", $notices.find(".woocommerce-error, .is-error").length > 0)
      .prop("hidden", text === "");
  }

  function applyCoupon() {
    var $coupon = $("[data-eres-coupon]");
    var $input = $coupon.find("#eres-coupon-code");
    var $button = $coupon.find(".eres-coupon__apply");
    var code = $.trim($input.val());
    if (code === "") {
      $input.trigger("focus");
      return;
    }

    $button.prop("disabled", true);
    $.post(wc_checkout_params.wc_ajax_url.toString().replace("%%endpoint%%", "apply_coupon"), {
      security: wc_checkout_params.apply_coupon_nonce,
      coupon_code: code,
      billing_email: $("#billing_email").val()
    })
      .done(function (noticesHtml) {
        showCouponMessage($coupon, noticesHtml);
        $(document.body)
          .trigger("applied_coupon_in_checkout", [code])
          .trigger("update_checkout", { update_shipping_method: false });
      })
      .always(function () {
        $button.prop("disabled", false);
      });
  }

  var VALIDATED_FIELDS = ".eres-field .input-text, .eres-field select";
  var PHONE_SEPARATORS = /[\s\-()]/g;
  var CHECKOUT_ERRORS = ".woocommerce-NoticeGroup-checkout";

  function formatErrorMessage(fieldId, value) {
    var rules = settings.validation;
    if (fieldId === "billing_email") {
      return new RegExp(rules.email.pattern).test(value) ? "" : rules.email.message;
    }
    if (fieldId === "billing_phone") {
      return new RegExp(rules.phone.pattern).test(value.replace(PHONE_SEPARATORS, "")) ? "" : rules.phone.message;
    }
    if (fieldId === "billing_numero_documento") {
      var documentRule = rules.documents[$("#billing_tipo_documento").val()] || rules.defaultDocument;
      return new RegExp(documentRule.pattern).test(value) ? "" : documentRule.message;
    }
    if (fieldId === "billing_address_1") {
      return value.length >= rules.address.minLength ? "" : rules.address.message;
    }
    return "";
  }

  function fieldErrorMessage(input) {
    var value = $.trim($(input).val());
    if (!settings.validation || !$(input).closest(".form-row").is(":visible")) {
      return "";
    }
    return value === "" ? settings.validation.required[input.id] || "" : formatErrorMessage(input.id, value);
  }

  function clearFieldError() {
    $(this).closest(".form-row").find(".eres-field-error, .checkout-inline-error-message").remove();
  }

  function showFieldError($row, message) {
    $row.find(".eres-field-error, .checkout-inline-error-message").remove();
    $row.removeClass("woocommerce-validated").addClass("woocommerce-invalid");
    $row.find(".input-text, select").attr("aria-invalid", "true");
    $("<p>", { "class": "eres-field-error", text: message }).appendTo($row);
  }

  function validateField() {
    var $row = $(this).closest(".form-row");
    var message = fieldErrorMessage(this);

    $row.find(".eres-field-error").remove();
    if (message !== "") {
      showFieldError($row, message);
    }
    return message === "";
  }

  function validateChangedField() {
    validateField.call(this);
  }

  function revalidateDocumentNumber() {
    var $number = $("#billing_numero_documento");
    if ($.trim($number.val()) !== "") {
      $number.trigger("change");
    }
  }

  function scrollToFirstError() {
    var $target = $(CHECKOUT_ERRORS + ", .form-row.woocommerce-invalid:visible").first();
    if ($target.length > 0) {
      $.scroll_to_notices($target);
    }
  }

  function validateAllFields() {
    var invalidFields = $(VALIDATED_FIELDS).filter(function () {
      return !validateField.call(this);
    });
    return invalidFields.length === 0;
  }

  // El script de Culqi escucha checkout_place_order y envía el pedido por su cuenta: hay que frenar el submit antes de que llegue a jQuery.
  function blockInvalidSubmit(event) {
    if (!$(event.target).is("form.checkout") || validateAllFields()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    $(CHECKOUT_ERRORS).remove();
    scrollToFirstError();
  }

  function showCheckoutErrors(messagesHtml) {
    var $form = $("form.checkout");
    $(CHECKOUT_ERRORS + ", .eres-field-error, .checkout-inline-error-message").remove();
    $form.prepend($("<div>", { "class": "woocommerce-NoticeGroup woocommerce-NoticeGroup-checkout" }).html(messagesHtml));
    $form.find(CHECKOUT_ERRORS + " li[data-id]").each(function () {
      var $row = $("#" + $(this).attr("data-id")).closest(".form-row");
      if ($row.length > 0) {
        showFieldError($row, $.trim($(this).text()));
      }
    });
    scrollToFirstError();
  }

  function parseCheckoutResponse(response) {
    if (typeof response !== "string") {
      return response;
    }
    try {
      return JSON.parse(response);
    } catch (error) {
      return null;
    }
  }

  // Culqi responde a un pedido rechazado con alert() y descarta los mensajes del servidor.
  function showFailureInsteadOfAlert(originalSuccess) {
    return function (response) {
      var result = parseCheckoutResponse(response);
      if (!result || result.result !== "failure") {
        return originalSuccess.apply(this, arguments);
      }

      var nativeAlert = window.alert;
      window.alert = $.noop;
      try {
        originalSuccess.apply(this, arguments);
      } finally {
        window.alert = nativeAlert;
      }

      if (result.reload) {
        window.location.reload();
        return;
      }
      if (result.refresh) {
        $(document.body).trigger("update_checkout");
      }
      if (result.messages && $(CHECKOUT_ERRORS).length === 0) {
        showCheckoutErrors(result.messages);
      }
    };
  }

  function watchCheckoutRequests(options) {
    if (options.url === wc_checkout_params.checkout_url && typeof options.success === "function") {
      options.success = showFailureInsteadOfAlert(options.success);
    }
  }

  function clearAllFieldErrors() {
    $(".eres-field-error").remove();
  }

  function toggleCouponForm() {
    var $toggle = $(this);
    var $form = $("#" + $toggle.attr("aria-controls"));
    var isOpening = $form.prop("hidden");
    $form.prop("hidden", !isOpening);
    $toggle.attr("aria-expanded", String(isOpening));
    if (isOpening) {
      $form.find("input").trigger("focus");
    }
  }

  function applyCouponOnEnter(event) {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    applyCoupon();
  }

  $(document.body)
    .on("change", "input.shipping_method", syncDeliveryAddress)
    .on("updated_checkout", syncDeliveryAddress)
    .on("click", ".eres-coupon__toggle", toggleCouponForm)
    .on("click", ".eres-coupon__apply", applyCoupon)
    .on("keydown", "#eres-coupon-code", applyCouponOnEnter)
    .on("focusout change", VALIDATED_FIELDS, validateChangedField)
    .on("input", VALIDATED_FIELDS, clearFieldError)
    .on("change", "#billing_tipo_documento", revalidateDocumentNumber)
    .on("checkout_error", clearAllFieldErrors);

  document.addEventListener("submit", blockInvalidSubmit, true);
  $.ajaxPrefilter(watchCheckoutRequests);

  $(syncDeliveryAddress);
})(jQuery);
