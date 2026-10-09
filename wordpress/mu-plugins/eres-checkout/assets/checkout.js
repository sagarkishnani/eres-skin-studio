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
    .on("keydown", "#eres-coupon-code", applyCouponOnEnter);

  $(syncDeliveryAddress);
})(jQuery);
