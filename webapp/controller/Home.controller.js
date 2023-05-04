sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller) {
    "use strict";

    return Controller.extend("commandearticle.controller.Home", {

        onInit : function () {
            const that = this
            // Get the Model and Get the DASet to initiate the values of the DA Tiles
            this.getOwnerComponent().getModel().read('/DemandeSet', {
                success: function(odata){
                    if(odata.results){
                        // Get all DASet    
                        const DASet = odata.results
                        // Get only the Accepted DA
                        const DASetAccepted = DASet.filter((e)=>e.Status == 'X')
                        that.getView().byId('_IDGenComparisonMicroChartData_Accepted').setValue(DASetAccepted.length)
                        // Get only the Non-accepted DA 
                        const DASetNotAccepted = DASet.filter((e)=>e.Status == '')
                        that.getView().byId('_IDGenComparisonMicroChartData5_Not_Accepted').setValue(DASetNotAccepted.length)
                    }
                },
                error: function(oerror){
                    console.log(oerror);
                    alert('Error in Getting the /DemandeSet')
                }
            })
        },
        onNavigateToArticles: function(){
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            if (oRouter) {
                oRouter.navTo("list");
            } else {
                alert("Error in routing : Navigation TO DA !\nCheck console");
            }
        },
        onNavigateToDAPage: function(){
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            if (oRouter) {
                oRouter.navTo("RouteDA");
            } else {
                alert("Error in routing : Navigation TO DA !\nCheck console");
            }
        },
        onNavigateToCAPage: function () {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            if (oRouter) {
                oRouter.navTo("RouteCA");
            } else {
                alert("Error in routing : Navigation TO CA !\nCheck console");
            }
        }
    });
});