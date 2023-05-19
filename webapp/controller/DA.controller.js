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

    return Controller.extend("commandearticle.controller.DA", {
      onInit: function () {
        /* Get the entityset DemandeSet and then set some values of the DA in the DA view */
        const that = this;
        this.getOwnerComponent()
          .getModel()
          .read("/DemandeSet", {
            success: function (oData) {
              if (oData.results.length) {
                // ************************************** VIEW MODEL **************************************
                // Set ALL DA to the Table view - To enable Autorefresh when entering the Page
                that
                  .getView()
                  .byId("_IDGenTable1")
                  .setModel(new sap.ui.model.json.JSONModel(oData.results));
                // ************************************** FILTER DATA **************************************
                // Number of DA
                const numberDA_all = oData.results.length;
                that
                  .getView()
                  .byId("_IDGenIconTabFilter1")
                  .setCount(numberDA_all);
                // Number of DA - Validée
                const numberDA_accepted = oData.results.filter(
                  (e) => e.Status == "X"
                ).length;
                that
                  .getView()
                  .byId("_IDGenIconTabFilter2")
                  .setCount(numberDA_accepted);
                // Number of DA - En cours
                const numberDA_pending = oData.results.filter(
                  (e) => e.Status == ""
                ).length;
                that
                  .getView()
                  .byId("_IDGenIconTabFilter3")
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
        const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        const { DemandeAchat, DateCreation, Utilisateur, Commentaire, Status } =
          oSelectedRowData;
        const newData = {
          DemandeAchat,
          DateCreation,
          Utilisateur,
          Commentaire,
          Status,
        };
        console.log(newData);
        if (oRouter) {
          oRouter.navTo("RouteDASingle", {
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
            aFilter.push(new Filter("Status", FilterOperator.EQ, ""));
            oBinding.filter(aFilter);
            break;

          case "v":
            aFilter.push(new Filter("Status", FilterOperator.EQ, "X"));
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
            new Filter("DemandeAchat", FilterOperator.Contains, sQuery)
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
                  alert(
                    "Error in routing : Navigation TO Articles !\nCheck console"
                  );
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
      },
    });
  }
);
