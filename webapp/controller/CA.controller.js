sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/m/Dialog",
      "sap/m/Button",
      "sap/ui/model/Filter",
      "sap/ui/model/FilterOperator",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Dialog, Button, Filter, FilterOperator) {
      "use strict";
  
      return Controller.extend("commandearticle.controller.CA", {
        onInit: function () {
          console.log('Hello from the CA');
          /* Get the entityset DemandeSet and then set some values of the DA in the DA view */
          const that = this;
          this.getOwnerComponent()
            .getModel()
            .read("/CommandeSet", {
              success: function (oData) {
                if (oData.results.length) {
                  console.log(oData.results);
                  // Changing Date Format
                  const odata = oData.results.map((e)=>{
                    e.Datecreation = new Date(e.Datecreation).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    e.DatelivraisonSouh = new Date(e.DatelivraisonSouh).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  })
                  console.log(odata);
                  // Number of DA
                  const numberDA_all = oData.results.length;
                  that
                    .getView()
                    .byId("_IDGenIconTabFilter1CA")
                    .setCount(numberDA_all);
                  // Number of DA - Validée
                  const numberDA_accepted = oData.results.filter(
                    (e) => e.Statut == "X"
                  ).length;
                  console.log('Number of Accepted '+ numberDA_accepted);
                  that
                    .getView()
                    .byId("_IDGenIconTabFilter2CA")
                    .setCount(numberDA_accepted);
                  // Number of DA - En cours
                  const numberDA_pending = oData.results.filter(
                    (e) => e.Statut == ""
                  ).length;
                  that
                    .getView()
                    .byId("_IDGenIconTabFilter3CA")
                    .setCount(numberDA_pending);
                  // Number of DA - Rejetée
                  //  const numberDA_deleted = oData.results.length.map((e)=>e.Supprime == 'X').length
                  // this.getView().byId("_IDGenIconTabFilter4").setCount(numberDA_deleted)
                }
              },
              error: function (error) {
                alert("Hey developer an error occured ! Check the console ");
              },
            });
        }, 
        onNavigateToSingleDAPage: function (oEvent) {
          const oSelectedItem = oEvent.getSource(); // Get the selected row
          const oBindingContext = oSelectedItem.getBindingContext(); // Get the binding context of the selected row
          const sPath = oBindingContext.getPath(); // Get the path of the selected row
          const oModel = oBindingContext.getModel(); // Get the model of the selected row
          // Get the data of the selected row
          const oSelectedRowData = oModel.getProperty(sPath);
          console.log('22');
          console.log(oSelectedRowData);
          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          const {NumCa,Fournisseur, Utulisateur, Datecreation, Statut, DatelivraisonSouh,Commantaire,DemandeAchat  } = oSelectedRowData
          const newData = {
              NumCa,
              Fournisseur,
              Utulisateur,
              Datecreation, 
              Statut,
              DatelivraisonSouh  ,
              Commantaire,
              DemandeAchat  
          }
          
          console.log(newData);
          if (oRouter) {
            oRouter.navTo("RouteCASingle", {
              object: JSON.stringify(newData),
            });
          } else {
            alert("Error in routing ! Check console");
          }
        },
        onFilter: function (oEvent) {
          // Get the Key of the filter onClick
          const sKey = oEvent.getParameter("key");
          // Prepare the filters array
          const aFilter = [];
          // Get the table from the view
          const oTable = this.byId("_IDGenTable1");
          // Get the binding to filer to apply filters
          const oBinding = oTable.getBinding("items");
          // OnClick display the related data using the mainData array declared above
          switch (sKey) {
            case "all":
              // No filter to apply, just empty array
              oBinding.filter([]);
              break;
            case "nv":
              aFilter.push(new Filter("Statut", FilterOperator.EQ, ""));
              oBinding.filter(aFilter);
              break;
  
            case "v":
              aFilter.push(new Filter("Statut", FilterOperator.EQ, "X"));
              oBinding.filter(aFilter);
              break;
            // case 'del':
            //   console.log('Fetch Deleted');
            //   break;
            default:
              break;
          }
        },
        onSearch: function (oEvent) {
          var aFilter = [];
          var sQuery = oEvent.getSource().getValue();
  
          if (sQuery && sQuery.length > 0) {
            aFilter.push(
              new Filter("NumCa", FilterOperator.Contains, sQuery)
            );
          }
  
          var oTable = this.byId("_IDGenTable1");
          var oBinding = oTable.getBinding("items");
          oBinding.filter(aFilter);
        },
        onNewDAClick: function () {
          const that = this;
          sap.m.MessageBox.show(
            "Vous allez être redirigé vers la page de selection d'articles !",
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
                      oRouter.navTo("list");
                  } else {
                      alert("Error in routing : Navigation TO Articles !\nCheck console");
                  }
                }
              },
            }
          );
        },
        onNavBackToDAHome: function () {
          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            if (oRouter) {
                oRouter.navTo("home");
            } else {
                alert("Error in routing : Navigation TO DA !\nCheck console");
            }
        }
      });
    }
  );
  