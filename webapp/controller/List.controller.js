sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/model/FilterOperator",
    "sap/m/GroupHeaderListItem",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "../model/formatter"
], function (BaseController, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Fragment, formatter) {
    "use strict";

    return BaseController.extend("commandearticle.controller.List", {

        formatter: formatter,
        onInit : function () {
            // Control state model
            var oList = this.byId("list"),
                oViewModel = this._createViewModel(),
                // Put down list's original value for busy indicator delay,
                // so it can be restored later on. Busy handling on the list is
                // taken care of by the list itself.
                iOriginalBusyDelay = oList.getBusyIndicatorDelay();


            this._oGroupFunctions = {
                PrixStandard: function(oContext) {
                    var iNumber = oContext.getProperty('PrixStandard'),
                        key, text;
                    if (iNumber <= 20) {
                        key = "LE20";
                        text = this.getResourceBundle().getText("listGroup1Header1");
                    } else {
                        key = "GT20";
                        text = this.getResourceBundle().getText("listGroup1Header2");
                    }
                    return {
                        key: key,
                        text: text
                    };
                }.bind(this)
            };

            this._oList = oList;
            // keeps the filter and search state
            this._oListFilterState = {
                aFilter : [],
                aSearch : []
            };

            this.setModel(oViewModel, "listView");
            // Make sure, busy indication is showing immediately so there is no
            // break after the busy indication for loading the view's meta data is
            // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            oList.attachEventOnce("updateFinished", function(){
                // Restore original busy indicator delay for the list
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            });

            this.getView().addEventDelegate({
                onBeforeFirstShow: function () {
                    this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
                }.bind(this)
            });

            this.getRouter().getRoute("list").attachPatternMatched(this._onMasterMatched, this);
            this.getRouter().attachBypassed(this.onBypassed, this);

            
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * After list data is available, this handler method updates the
         * list counter
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished : function (oEvent) {
            // update the list object counter after new data is loaded
            this._updateListItemCount(oEvent.getParameter("total"));
        },
        _onGenerateIDs : function(){
            const min = 10000000;
            const max = 99999999;
            return Math.floor(Math.random() * (max - min + 1)) + min;
          },
        _onAddedPost : function(oModel, firstElement, arrayOfElements) {
            const that = this
            oModel.create('/postedemandeSet', firstElement, {
              success : function(Result){
                console.log(Result);
                const remainingElements = arrayOfElements.slice(1); // Delete the first one and then get copy with remaining elements
                if (remainingElements.length > 0) {
                  // call the function recursively with the next element
                  that._onAddedPost(oModel, remainingElements[0], remainingElements);
                }else{
                    sap.m.MessageBox.show(
                      "Traitement terminé avec succès ! Vous allez être redirigé vers la page d'acceuil",
                      {
                        icon: sap.m.MessageBox.Icon.INFORMATION,
                        title: "Confirmation",
                        actions: [
                          sap.m.MessageBox.Action.OK,
                          sap.m.MessageBox.Action.CANCEL,
                        ],
                        onClose: function (oAction) {
                          if (oAction === sap.m.MessageBox.Action.OK) {
                            console.log("Redirect to new Page");
                            const oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                            if (oRouter) {
                                oRouter.navTo("home", {}, true);
                            } else {
                                alert("Error in routing : Navigation TO Articles !\nCheck console");
                            }
                          }
                        },
                      }
                    );
                }
              },
              error: function(Error){
                console.log(Error);
              }
            })
        },
        onNavigateToHome: function(){
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            if (oRouter) {
                oRouter.navTo("home");
            } else {
                alert("Error in routing : Navigation TO DA !\nCheck console");
            }
        },
        onCommander: function () {
            console.log("OK");
            var list = this.getView().byId("list");
            var selectedItems = list.getSelectedItems();
            var selectedItemsArray = [];
            if (selectedItems) {
              console.log("IN");
              console.log(selectedItems);
              for (var i = 0; i < selectedItems.length; i++) {
                var selectedObject = selectedItems[i]
                  .getBindingContext()
                  .getObject();
                selectedItemsArray.push(selectedObject);
              }
              
              const that = this;
    
              console.log(selectedItemsArray);
    
              var oDialog = new sap.m.Dialog({
                title: "Confirmation des Articles",
                icon: "sap-icon://home",
                contentWidth: "40%",
                content: selectedItemsArray.map((item, index) => {
                  var itemId = `${item.CodeArticle}`;
                  return new sap.m.Panel({
                    headerText: `Article - ${item.CodeArticle}`,
                    content: [
                      new sap.m.Label({
                        id: `LB-${itemId}`,
                        showColon: true,
                        text: "Designation",
                      }),
                      new sap.m.Text({
                        id: `TA-${itemId}`,
                        width: "100%",
                        text: item.Designation,
                      }),
                      new sap.m.Label({
                        id: `LB2-${itemId}`,
                        showColon: true,
                        text: "Prix standard",
                      }),
                      new sap.m.Text({
                        id: `TA2-${itemId}`,
                        width: "100%",
                        text: `${item.PrixStandard} ${item.Devise}`,
                      }),
                      new sap.m.Label({
                        id: `LB3-${itemId}`,
                        showColon: true,
                        text: "Quantité souhaité",
                      }),
                      new sap.m.Input({
                        id: `In-${itemId}`,
                        type: sap.m.InputType.Number,
                        min: 0,
                        valueState: sap.ui.core.ValueState.Error,
                        valueStateText: "The value must be non-negative"
                      }),
                    ],
                  });
                }),
                beginButton: new sap.m.Button({
                  text: "Confirmer",
                  type: "Accept",
                  icon: "sap-icon://add",
                  press: function () {
                    const demande_header = {
                        "DateCreation" : `\/Date(${new Date().getTime()})\/`, 
                        "DemandeAchat" : `${that._onGenerateIDs()}`,
                        "Utilisateur" : "Developper",
                        "Commentaire" : "Demande pour client Inwi",
                        "Status" : ""
                    }
                    // les elements de la table header des demandes (Demande D'achat)
                    var itemsWithQuantity = [];
                    oDialog.getContent().forEach(function (panel, index) {
                        const itemId = panel.getHeaderText().split(" - ")[1];
                        const quantityInput = sap.ui.getCore().byId("In-" + itemId);
                        var item = {
                            "DemandeAchat": demande_header.DemandeAchat,
                            "Utilisateur" : "Developper",
                            "CodeArtcile" : panel.getHeaderText().split(" - ")[1],
                            "Quantite" : `${parseInt(quantityInput.getValue(), 10) || 0}`,
                            "Unite": "ST",
                            "Prix": sap.ui.getCore().byId("TA2-" + itemId).getText().split(" ")[0],
                            "Devise": sap.ui.getCore().byId("TA2-" + itemId).getText().split(" ")[1],
                            "Commentaire": sap.ui.getCore().byId("TA-" + itemId).getText(),
                            "PosteDemande" : `00${(index+1)*10}`
                        }
                    itemsWithQuantity.push(item);
                    });

                    //Insertion des postes demandes

                    console.log(demande_header);
                    console.log(itemsWithQuantity);

                    const oModel = that.getOwnerComponent().getModel()
                    // Array of promises 
                    const promises = new Array()
                    // Add the first Call to the Promise
                    promises.push(
                      new Promise(function (resolve, reject) {
                        oModel.create('/DemandeSet', demande_header, {
                          success: function (res) {
                            console.log('Demande Header is Executed Successfully !')
                            console.log(res)
                            resolve(res)
                          },
                          error: function (err) {
                            alert('ERREUR DANS COMMANDE ENTETE')
                            reject(err)
                          }
                        })
                      })
                    )
                    // Execute the First promise and then move to the Object Items
                    Promise.all(promises).then(() => {
                        that._onAddedPost(oModel, itemsWithQuantity[0], itemsWithQuantity)
                    }).catch((err) => {
                      console.log(err);
                    })

                    oDialog.close();
                    oDialog.destroyContent();
                  },
                }),
                endButton: new sap.m.Button({
                  text: "Annuler",
                  type: "Reject",
                  icon: "sap-icon://undo",
                  press: function () {
                    // handle button press event...
                    oDialog.close();
                    oDialog.destroyContent();
                  },
                }),
              });
              oDialog.open();
            }
          },

        /**
         * Event handler for the list search field. Applies current
         * filter value and triggers a new search. If the search field's
         * 'refresh' button has been pressed, no new search is triggered
         * and the list binding is refresh instead.
         * @param {sap.ui.base.Event} oEvent the search event
         * @public
         */
        onSearch: function (oEvent) {

            // console.log(oEvent.getParameter("query"));
            console.log(oEvent.getSource().getValue());

            if(oEvent){
                const aFilter = [];
                const sQuery = oEvent.getSource().getValue();
    
                console.log("Query p :", sQuery);
                if (sQuery && sQuery.length > 0) {
                    aFilter.push(new Filter("Designation", FilterOperator.Contains, sQuery));
                }
    
                var oTable = this.byId("list");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilter);

            }
        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function () {
            this._oList.getBinding("items").refresh();
        },

        /**
         * Event handler for the filter, sort and group buttons to open the ViewSettingsDialog.
         * @param {sap.ui.base.Event} oEvent the button press event
         * @public
         */
        onOpenViewSettings: function (oEvent) {
            var sDialogTab = "filter";
            if (oEvent.getSource() instanceof sap.m.Button) {
                var sButtonId = oEvent.getSource().getId();
                if (sButtonId.match("sort")) {
                    sDialogTab = "sort";
                } else if (sButtonId.match("group")) {
                    sDialogTab = "group";
                }
            }
            // load asynchronous XML fragment
            if (!this.byId("viewSettingsDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "commandearticle.view.ViewSettingsDialog",
                    controller: this
                }).then(function(oDialog){
                    // connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(oDialog);
                    oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
                    oDialog.open(sDialogTab);
                }.bind(this));
            } else {
                this.byId("viewSettingsDialog").open(sDialogTab);
            }
        },

        /**
         * Event handler called when ViewSettingsDialog has been confirmed, i.e.
         * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
         * are applied to the list, which can also mean that they
         * are removed from the list, in case they are
         * removed in the ViewSettingsDialog.
         * @param {sap.ui.base.Event} oEvent the confirm event
         * @public
         */
        onConfirmViewSettingsDialog: function (oEvent) {
            
            var aFilterItems = oEvent.getParameters().filterItems,
                aFilters = [],
                aCaptions = [];

            // update filter state:
            // combine the filter array and the filter string
            aFilterItems.forEach(function (oItem) {
                switch (oItem.getKey()) {
                    case "Filter1" :
                        aFilters.push(new Filter("PrixStandard", FilterOperator.LE, 100));
                        break;
                    case "Filter2" :
                        aFilters.push(new Filter("PrixStandard", FilterOperator.GT, 100));
                        break;
                    default :
                        break;
                }
                aCaptions.push(oItem.getText());
            });

            this._oListFilterState.aFilter = aFilters;
            this._updateFilterBar(aCaptions.join(", "));
            this._applyFilterSearch();
            this._applySortGroup(oEvent);
        },

        /**
         * Apply the chosen sorter and grouper to the list
         * @param {sap.ui.base.Event} oEvent the confirm event
         * @private
         */
        _applySortGroup: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath,
                bDescending,
                aSorters = [];
            
            // apply sorter to binding
            // (grouping comes before sorting)
            if (mParams.groupItem) {
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                var vGroup = this._oGroupFunctions[sPath];
                aSorters.push(new Sorter(sPath, bDescending, vGroup));
            }
            
            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            this._oList.getBinding("items").sort(aSorters);
        },

        /**
         * Event handler for the list selection event
         * @param {sap.ui.base.Event} oEvent the list selectionChange event
         * @public
         */
        onSelectionChange: function (oEvent) {
            var oList = oEvent.getSource(),
                bSelected = oEvent.getParameter("selected");
                console.log('onSelectionChange');
                
                console.log(bSelected);
                
                
            // skip navigation when deselecting an item in multi selection mode
            if (!(!oList.getMode() === "MultiSelect" && !bSelected)) {
                // get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
                this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
                // this.getView().byId('commButton').setEnabled(true)
            }
        },
        /**
         * Event handler for the bypassed event, which is fired when no routing pattern matched.
         * If there was an object selected in the list, that selection is removed.
         * @public
         */
        onBypassed: function () {
            this._oList.removeSelections(true);
        },

        /**
         * Used to create GroupHeaders with non-capitalized caption.
         * These headers are inserted into the list to
         * group the list's items.
         * @param {Object} oGroup group whose text is to be displayed
         * @public
         * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
         */
        createGroupHeader: function (oGroup) {
            return new GroupHeaderListItem({
                title : oGroup.text,
                upperCase : false
            });
        },

        /**
         * Event handler for navigating back.
         * We navigate back in the browser history
         * @public
         */
        onNavBack: function() {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */


        _createViewModel: function() {
            return new JSONModel({
                isFilterBarVisible: false,
                filterBarLabel: "",
                delay: 0,
                title: this.getResourceBundle().getText("listTitleCount", [0]),
                noDataText: this.getResourceBundle().getText("listListNoDataText"),
                sortBy: "CodeArticle",
                groupBy: "None"
            });
        },

        _onMasterMatched:  function() {
            //Set the layout property of the FCL control to 'OneColumn'
            this.getModel("appView").setProperty("/layout", "OneColumn");
        },

        /**
         * Shows the selected item on the detail page
         * On phones a additional history entry is created
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showDetail: function (oItem) {
            var bReplace = !Device.system.phone;
            // set the layout property of FCL control to show two columns
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            this.getRouter().navTo("object", {
                objectId : oItem.getBindingContext().getProperty("CodeArticle")
            }, bReplace);
        },

        /**
         * Sets the item count on the list header
         * @param {integer} iTotalItems the total number of items in the list
         * @private
         */
        _updateListItemCount: function (iTotalItems) {
            var sTitle;
            // only update the counter if the length is final
            if (this._oList.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("listTitleCount", [iTotalItems]);
                this.getModel("listView").setProperty("/title", sTitle);
            }
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @private
         */
        _applyFilterSearch: function () {
            var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
                oViewModel = this.getModel("listView");
            this._oList.getBinding("items").filter(aFilters, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aFilters.length !== 0) {
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("listListNoDataWithFilterOrSearchText"));
            } else if (this._oListFilterState.aSearch.length > 0) {
                // only reset the no data text to default when no new search was triggered
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("listListNoDataText"));
            }
        },

        /**
         * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
         * @param {string} sFilterBarText the selected filter value
         * @private
         */
        _updateFilterBar : function (sFilterBarText) {
            var oViewModel = this.getModel("listView");
            oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
            oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("listFilterBarText", [sFilterBarText]));
        }

    });

});