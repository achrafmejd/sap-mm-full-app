sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, Filter, FilterOperator, Fragment) {
        "use strict";

        return Controller.extend("commandearticle.controller.CASingle", {
              onInit: function () {
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this); // Get the router instance
                oRouter
                  .getRoute("RouteCASingle")
                  .attachPatternMatched(this._onItemMatched, this);
              },
              _onItemMatched: function (oEvent) {
                const that = this;
                const oSelectedItem = oEvent.getParameter("arguments").object;
                console.log(oSelectedItem);
                const jModel = new sap.ui.model.json.JSONModel(
                  JSON.parse(oSelectedItem)
                );
                this.getView().setModel(jModel);
                this.getView().bindElement({
                  path: "/",
                });
        
                const oModel = this.getOwnerComponent().getModel();
                // Prepare the filters array
                const aFilter = [];
                console.log(JSON.parse(oSelectedItem).DemandeAchat);
                aFilter.push(
                  new Filter(
                    "NumCa",
                    FilterOperator.Contains,
                    JSON.parse(oSelectedItem).NumCa
                  )
                );
        
                const oExistingModel = this.getView().getModel();
        
                oModel.read(`/postecommandeSet`, {
                  filters: aFilter,
                  success: function (oData) {
                    console.log(oData.results);
                    // // oObject = oData;
                    // // Set the Data to the view
                    // oExistingModel.setData(oData.results)
                    // const jModel = new sap.ui.model.json.JSONModel(oData.results);
                    // that.getView().byId("_IDGenTable1").setModel(jModel, "myModel");
        
                    // that.getView().byId("_IDGenTable1").setModel(jModel);
                    // that.getView().byId("_IDGenTable1").bindElement({
                    //     path: "/poste"
                    // });
                    // here
                    var oTable = that.getView().byId("_IDGenTable1");
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData({
                      items: oData.results,
                    });
                    oTable.setModel(oModel);
                    oTable.bindItems(
                      "/items",
                      new sap.m.ColumnListItem({
                        cells: [
                          new sap.m.Image({
                            src: "{= '../images/' + ${CodeArticle} + '.png' }",
                            width: "50%",
                          }),
                          new sap.m.Text({
                            text: "{NumPoste}",
                          }),
                          new sap.m.Text({
                            text: "{CodeArticle}",
                          }),
                          new sap.m.Text({
                            text: "{Designation}",
                          }),
                          new sap.m.Text({
                            text: "{Qte} {UniteMesure}",
                          }),
                          new sap.m.Text({
                            text: "{PuConvenu} {DevisePu}",
                          }),
                        ],
                      })
                    );
                  },
                  error: function (oError) {
                    console.log(oError);
                  },
                });
              },
              _onGetDialogContent: function (DAArticles) {
                // Get the Model for Getting ARTFRN Entityset
                const dataModel = this.getOwnerComponent().getModel();
                // Return the formed array only if DAArticles is defined
                const that = this
                return (
                  DAArticles &&
                  DAArticles.map((item, index) => {
                    // Get the Item Id of the current item for specifying it when building elements
                    const itemId = item.CodeArtcile;
                    // Prepare the Panel for each item
                    return new sap.m.Panel({
                      id: `pn-${itemId}`,
                      headerText: `Article : ${itemId}`,
                      content: [
                        new sap.m.Panel({
                          id: `pn-info-${itemId}`,
                          headerText: `Informations sur article`,
                          content: [
                            new sap.m.FlexBox({
                              id: "",
                              direction: "Column",
                              justifyContent: "Start",
                              items: [
                                new sap.m.Text({
                                  id: `TA-${itemId}`,
                                  width: "100%",
                                  text: `Description : ${item.Commentaire}`,
                                }),
                                new sap.m.Text({
                                  id: `TA2-${itemId}`,
                                  width: "100%",
                                  text: `Prix unitaire : ${item.Prix} ${item.Devise}`,
                                }),
                                new sap.m.Text({
                                  id: `In-${itemId}`,
                                  text: `Quantité Demandée : ${item.Quantite}  ${item.Unite}`,
                                }),
                                new sap.m.Text({
                                  id: `I8-${itemId}`,
                                  text: "Fournisseur",
                                }),
                                new sap.m.Input({
                                  id: `inputValueHelpCustomIcon-${itemId}`,
                                  type: "Text",
                                  width: "70%",
                                  placeholder: "Choisissez le Fournisseur souhaité",
                                  showValueHelp: true,
                                  valueHelpIconSrc: "sap-icon://value-help",
                                  valueHelpRequest: function () {
                                    // Preapare the Filter
                                    const aFilter = [
                                      new Filter(
                                        "CodeArticle",
                                        FilterOperator.Contains,
                                        itemId
                                      ),
                                    ];
        
                                    const List = new sap.m.List({
                                      id: "List_fournisseur_prix",
                                      mode: "SingleSelectLeft",
                                      items: {
                                        path: "/",
                                        template: new sap.m.StandardListItem({
                                          title: "{Fournisseur}",
                                          description:
                                            "Prix de Vente : {PrixAchat} {Devise}",
                                          info: "Quantité disponible : {Quantite} {Unite}",
                                        }),
                                      },
                                    });
                                    dataModel.read("/ArticleFournisseurSet", {
                                      filters: aFilter,
                                      success: function (oData) {
                                        console.log("Hello");
                                        if (oData.results.length) {
                                          console.log(oData.results);
        
                                          const jModel =
                                            new sap.ui.model.json.JSONModel(
                                              oData.results
                                            );
        
                                          List.setModel(jModel);
                                        } else {
                                          alert("No Fournisseur");
                                        }
                                      },
                                      error: function (error) {
                                        console.log(error);
                                      },
                                    });
        
                                    const that = this;
                                    const oVendorsPriceDialog = new sap.m.Dialog({
                                      icon: "sap-icon://open-command-field",
                                      title: "Procéder à la Commande d'Achat",
                                      contentWidth: "70%",
                                      // Content of the Dialog of ValueHelp
                                      content: [List],
                                      beginButton: new sap.m.Button({
                                        // type: "Accept",
                                        // icon: "sap-icon://accept",
                                        text: "Choisir",
                                        press: function () {
                                          const oSelectedItem = List.getSelectedItem();
                                          if (oSelectedItem) {
                                            // input.setValue(oSelectedItem.getTitle())
                                            sap.ui
                                              .getCore()
                                              .byId(
                                                `inputValueHelpCustomIcon-${itemId}`
                                              )
                                              .setValue(oSelectedItem.getTitle());
                                            sap.ui
                                              .getCore()
                                              .byId(
                                                `inputValueHelpCustomIcon-${itemId}`
                                              )
                                              .setEnabled(false);
        
                                            console.log(
                                              oSelectedItem
                                                .getBindingContext()
                                                .getObject()
                                            );
                                            const selectedItemPlain = oSelectedItem
                                              .getBindingContext()
                                              .getObject();
                                            const quantity = sap.ui
                                              .getCore()
                                              .byId(`In-${itemId}`)
                                              .getText()
                                              .split(":")[1]
                                              .trim()
                                              .split(" ")[0];
                                            console.log(quantity);
        
                                            console.log(
                                              "Total ",
                                              parseInt(selectedItemPlain.PrixAchat) *
                                              parseInt(quantity)
                                            );
        
                                            sap.ui
                                              .getCore()
                                              .byId(`Summary-Price-Vendors-${itemId}`)
                                              .setText(
                                                `Prix d'Achat Total (Fournisseur) : ${selectedItemPlain.PrixAchat} MAD`
                                              );
        
                                            sap.ui
                                              .getCore()
                                              .byId(`Summary-Total-Bill-${itemId}`)
                                              .setText(
                                                `Total (Qte x Prix) : ${parseInt(
                                                  selectedItemPlain.PrixAchat
                                                ) * parseInt(quantity)
                                                } MAD`
                                              );
                                          } else {
                                            console.log("No item selected");
                                          }
                                          oVendorsPriceDialog.close();
                                          oVendorsPriceDialog.destroyContent();
                                        },
                                      }),
                                      endButton: new sap.m.Button({
                                        // type: "Accept",
                                        // icon: "sap-icon://accept",
                                        text: "Fermer",
                                        press: function () {
                                          oVendorsPriceDialog.close();
                                          oVendorsPriceDialog.destroyContent();
                                        },
                                      }),
                                    });
        
                                    oVendorsPriceDialog.open();
                                  },
                                }),
                              ],
                            }),
                          ],
                        }),
                        new sap.m.Panel({
                          id: `pn-summary-${itemId}`,
                          headerText: `Résumé`,
                          content: [
                            new sap.m.FlexBox({
                              id: "",
                              direction: "Column",
                              justifyContent: "Start",
                              items: [
                                new sap.m.Text({
                                  id: `Summary-Price-Vendors-${itemId}`,
                                  text: "Prix d'Achat Total : (Fournisseur)",
                                }),
                                new sap.m.Text({
                                  id: `Summary-Total-Bill-${itemId}`,
                                  text: "Total : (Qte x Prix)",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    });
                  })
                );
              },
              _onGenerateIDs: function () {
                const min = 10000000;
                const max = 99999999;
                return Math.floor(Math.random() * (max - min + 1)) + min;
              },
              _onGetConfirmModal: function () {
                const confirmDialog = new sap.m.Dialog({
                  icon: "sap-icon://open-command-field",
                  title: "Confirmation",
                  contentWidth: '50%',
                  content: [
                    new sap.m.Panel({
        
                    })
                  ]
                })
              },
              onNavBackToDAHome: function () {
                const oHistory = History.getInstance();
                const sPreviousHash = oHistory.getPreviousHash();
        
                if (sPreviousHash !== undefined) {
                  window.history.go(-1);
                } else {
                  const oRouter = this.getOwnerComponent().getRouter();
                  oRouter.navTo("RouteCA", {}, true);
                }
              },
              _onGetOrderItems: function (DAArticles, order_header) {
                let items = []
                DAArticles.map((article, index) => {
                  const PuConvenu = sap.ui.getCore().byId(`Summary-Price-Vendors-${article.CodeArtcile}`).getText().split(':')[1].trim().split(' ')[0].trim()
                  const Montant = sap.ui.getCore().byId(`Summary-Total-Bill-${article.CodeArtcile}`).getText().split(':')[1].trim().split(' ')[0].trim()
                  const element = {
                    "NumCa": `${order_header.NumCa}`,
                    "NumPoste": `${article.PosteDemande}`,
                    "Utulisateur": "Developer",
                    "Datecreation": `\/Date(${new Date().getTime()})\/`,
                    "CodeArticle": `${article.CodeArtcile}`,
                    "Designation": `${article.Commentaire}`,
                    "Qte": `${article.Quantite}`,
                    "UniteMesure": `${article.Unite}`,
                    "PuConvenu": `${PuConvenu}`, // Du fournisseur
                    "DevisePu": `${article.Devise}`, // Du fournisseur
                    "Montant": `${Montant}`, // Total
                    "Commantaire": "Commentaire de Test par Achraf",
                    "Unit": `${article.Devise}`
                  }
        
                  items.push(element)
                })
        
                return items;
              },
              _onGetAddItem: function (oModel, firstElement, arrayOfElements) {
                  const that = this
                  oModel.create('/postecommandeSet', firstElement, {
                    success : function(Result){
                      console.log(Result);
                      const remainingElements = arrayOfElements.slice(1); // Delete the first one and then get copy with remaining elements
                      if (remainingElements.length > 0) {
                        // call the function recursively with the next element
                        that._onGetAddItem(oModel, remainingElements[0], remainingElements);
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
                                    oRouter.navTo("home");
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
              onConvertDAtoCA: function () {
                const that = this;
                // Get the Data bound to the Table
                const DAArticles = this.getView()
                  .byId("_IDGenTable1")
                  .getModel()
                  .getData().items;
                console.log(DAArticles); // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> REMOVE THIS LINE
                // Create the Dialog to display all the Products/Articles of a DA
                const oDialog = new sap.m.Dialog({
                  icon: "sap-icon://open-command-field",
                  title: "Procéder à la Commande d'Achat",
                  contentWidth: "50%",
                  // Content of the Dialog of CA - Call the function defined above
                  content: this._onGetDialogContent(DAArticles),
                  beginButton: new sap.m.Button({
                    type: "Accept",
                    icon: "sap-icon://accept",
                    text: "Confirmer",
                    press: function () {
                      console.log('#######################################  APIS  #######################################') // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> REMOVE THIS LINE
                      // Get the Busy Dialog from the View and Open It to prevent any user communication during - Start
                      const oBusyDialog = that.byId("BusyDialog");
                      // oBusyDialog.open();
                      // Get the Busy Dialog from the View and Open It to prevent any user communication during - End
        
                      const order_header = {
                        "NumCa": `${that._onGenerateIDs()}`, // Do it in the Bakcend ! UPDATE
                        "Utulisateur": "Developer", // Get the use from the session ! UPDATE 
                        "Datecreation": `\/Date(${new Date().getTime()})\/`,
                        "Statut": "A", // By default I use this, To confirm 
                        "DatelivraisonSouh": `\/Date(${new Date().getTime()})\/`,
                        "Commantaire": "Commentaire de Test par Achraf",
                        "DemandeAchat": `${that.getView().byId('_IDGenObjectHeader1').getTitle().split("#")[1].trim()}`
                      }
                      const order_items = that._onGetOrderItems(DAArticles, order_header);
        
        
                      console.log(order_header);
                      console.log(order_items);
        
                      // Get the Model
                      const oModel = that.getOwnerComponent().getModel()
                      // Array of promises 
                      const promises = new Array()
                      // Add the first Call to the Promise
                      promises.push(
                        new Promise(function (resolve, reject) {
                          oModel.create('/CommandeSet', order_header, {
                            success: function (res) {
                              console.log('Order Header is Executed Successfully !')
                              console.log(res)
                              resolve(res)
                            },
                            error: function (err) {
                              oBusyDialog.close()
                              alert('ERREUR DANS COMMANDE ENTETE')
                              reject(err)
                            }
                          })
                        })
                      )
                      // Execute the First promise and then move to the Object Items
                      Promise.all(promises).then(() => {
                          that._onGetAddItem(oModel, order_items[0], order_items)
                      }).catch((err) => {
                        console.log(err);
                      })
        
        
        
                      oDialog.close();
                      oDialog.destroyContent();
                    },
                  }),
                  endButton: new sap.m.Button({
                    type: "Reject",
                    icon: "sap-icon://decline",
                    text: "Annuler",
                    press: function () {
                      oDialog.close();
                      oDialog.destroyContent();
                    },
                  }),
                });
                // Open the Dialog - First time after executing the function
                oDialog.open();
              },
        });
    });
