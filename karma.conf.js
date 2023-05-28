module.exports = function(config) {
    config.set({
  
      frameworks: ["ui5"],
  
      ui5: {
        url: "http://localhost:8082/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#commandearticle-display&/"
      },
   
      browsers: ["Chrome"]
      
      });
    };