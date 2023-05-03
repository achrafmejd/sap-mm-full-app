sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller) {
    "use strict";

    return Controller.extend("commandearticle.controller.Home", {

        onInit : function () {
            
        },
        onNavigateToArticles: function(){
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            if (oRouter) {
                oRouter.navTo("list");
            } else {
                alert("Error in routing : Navigation TO DA !\nCheck console");
            }
        }

    });
});