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

  $(document.body)
    .on("change", "input.shipping_method", syncDeliveryAddress)
    .on("updated_checkout", syncDeliveryAddress);

  $(syncDeliveryAddress);
})(jQuery);
