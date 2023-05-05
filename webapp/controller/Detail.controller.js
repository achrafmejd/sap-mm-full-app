sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    'sap/viz/ui5/format/ChartFormatter',
], function (BaseController, JSONModel, formatter, mobileLibrary,Filter,FilterOperator, Controller, History, ChartFormatter) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return BaseController.extend("commandearticle.controller.Detail", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data

            
            var oViewModel = new JSONModel({
                busy : false,
                delay : 0
            });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "detailView");

            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

            
        },

		onSaveButtonPress: function(oEvent) {
			MessageToast.show("Pressed custom button " + oEvent.getSource().getId());
		},

		showFooter: function() {
			this.oSemanticPage.setShowFooter(!this.oSemanticPage.getShowFooter());
              
		},

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onSendEmailPress: function () {
            var oViewModel = this.getModel("detailView");

            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        },


        

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

        /**
         * Binds the view to the object path and expands the aggregated line items.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onGetPercentage(myData, field, value) {
            // Calculate the sum
            let sum = 0
            console.log('FROM GetPertance');
            console.log(myData);
            myData.forEach((item) => {
                console.log('From Item');
                console.log(item);
                if (item[field] == value) {
                    sum += 1
                }
            })
            console.log('SUM' + sum);
            // Calculate the percentage
            const percentageLand = (sum / myData.length) * 100;
            return percentageLand
        },
        _onObjectMatched: function (oEvent) {
            var sObjectId =  oEvent.getParameter("arguments").objectId;
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            this.getModel().metadataLoaded().then( function() {
                var sObjectPath = this.getModel().createKey("ArticleeSet", {
                    CodeArticle:  sObjectId
                });
                this._bindView("/" + sObjectPath);
            }.bind(this));
            var mymodel = this.getOwnerComponent().getModel();
            var Filters = new Array();
            Filters.push(new Filter("CodeArticle",FilterOperator.Contains,sObjectId))
            const that = this;
            mymodel.read("/ArticleFournisseurSet",{
                filters: Filters,
                success: function(oData){
                    console.log(oData.results);
                    var oTable = that.getView().byId("idProductsTable");
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData({
                    items: oData.results,
                    });
                    oTable.setModel(oModel);
                    oTable.bindItems({
                        path: "/items",
                        template: new sap.m.ColumnListItem({
                          cells: [
                            new sap.m.Text({
                                text: "{Fournisseur}"
                            }),
                            new sap.m.Text({
                                text: "{PrixAchat}"
                            }),
                            new sap.m.Text({
                                text: "{Devise}"
                            }),
                            new sap.m.Text({
                                text: "{Quantite}"
                            }),
                            new sap.m.Text({
                                text: "{Unite}"
                            })
                          ]
                        })
                      });


                    // Start API Call here for Getting Number of DA 
                    mymodel.read('/postecommandeSet', {
                        success: function(odata){
                            if(odata.results){
                                console.log('From the postecommandeSet');
                                console.log(odata.results);
                                const all_data = odata.results;
                                // console.log(all_data);
                                console.log('Article '+ sObjectId);
                                const accepted_ca = all_data.filter((e)=>e.CodeArticle == sObjectId).length;
                                console.log(accepted_ca);

                                var oRadialMicroChart = that.getView().byId("_IDGenHarveyBallMicroChartItemFirst");
                                // Calculate and set values to the view
                                oRadialMicroChart.setFraction(23,2);
                                
                            }
                        },
                        error: function(err){
                            console.log(err);
                            alert('Error in the Poste Commande Call APIs !')
                        }
                    })
                },
                error: function(error){
                    console.log(error);
                }
            })

            // const data = {
            //     myData: [
            //         {
            //             "Commande": "Validée",
            //             "Nombre": 50
            //         },
            //         {
            //             "Commande": "Non Validée",
            //             "Nombre": 40
            //         },
            //         {
            //             "Commande": "Supprimée",
            //             "Nombre": 10
            //         }
            //     ]
            // }
            // var jsonData = new sap.ui.model.json.JSONModel(data);
            // var oVizFrame = this.getView().byId("idVizFrame");
            // if(oVizFrame){
            //     oVizFrame.setModel(jsonData);
            //     oVizFrame.setVizProperties({
            //         plotArea: {
            //             dataLabel: {
            //                 visible: true
            //             }
            //         }
            //     });
            // }

            // var oPopOver = this.getView().byId("idPopOver");
            // oPopOver.connect(oVizFrame.getVizUid());
            // oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
        },

        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        _bindView: function (sObjectPath) {
            // Set busy indicator during view binding
            var oViewModel = this.getModel("detailView");

            // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
            oViewModel.setProperty("/busy", false);

            this.getView().bindElement({
                path : sObjectPath,
                events: {
                    change : this._onBindingChange.bind(this),
                    dataRequested : function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("detailObjectNotFound");
                // if object could not be found, the selection in the list
                // does not make sense anymore.
                this.getOwnerComponent().oListSelector.clearListListSelection();
                return;
            }

            var sPath = oElementBinding.getPath(),
                oResourceBundle = this.getResourceBundle(),
                oObject = oView.getModel().getObject(sPath),
                sObjectId = oObject.CodeArticle,
                sObjectName = oObject.CodeArticle,
                oViewModel = this.getModel("detailView");

            this.getOwnerComponent().oListSelector.selectAListItem(sPath);

            oViewModel.setProperty("/shareSendEmailSubject",
                oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage",
                oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        },

        _onMetadataLoaded: function () {
            // Store original busy indicator delay for the detail view
            var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
                oViewModel = this.getModel("detailView");

            // Make sure busy indicator is displayed immediately when
            // detail view is displayed for the first time
            oViewModel.setProperty("/delay", 0);

            // Binding the view will set it to not busy - so the view is always busy if it is not bound
            oViewModel.setProperty("/busy", true);
            // Restore original busy indicator delay for the detail view
            oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
        },

        /**
         * Set the full screen mode to false and navigate to list page
         */
        onCloseDetailPress: function () {
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
            // No item should be selected on list after detail page is closed
            this.getOwnerComponent().oListSelector.clearMasterListSelection();
            this.getRouter().navTo("list");
        },

        /**
         * Toggle between full and non full screen mode.
         */
        toggleFullScreen: function () {
            var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
            if (!bFullScreen) {
                // store current layout and go full screen
                this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
                this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
            } else {
                // reset to previous layout
                this.getModel("appView").setProperty("/layout",  this.getModel("appView").getProperty("/previousLayout"));
            }
        }
    });

});