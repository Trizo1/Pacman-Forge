let viewer;
const documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDIwLTEwLTE5LTE5LTI0LTA0LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlLyVEMCU5NyVEMCVCMCVEMCVCMSVEMCVCRSVEMSU4MCUyMCVEMCU5NiVEMCVCMCVEMCVCQiVEMSU4RSVEMCVCNyVEMCVCOCUyMHYzNC5mM2Q'
const options = {
    env: 'AutodeskProduction',
    api: 'derivativeV2',  // for models uploaded to EMEA change this option to 'derivativeV2_EU'
    getAccessToken: getForgeToken,
}


function getForgeToken(onTokenReady) {
    $.get("/oauth", (data) => {
        const token = data.access_token;
        const timeInSeconds = data.expires_in; // Use value provided by Forge Authentication (OAuth) API
        onTokenReady(token, timeInSeconds);
    });
}

Autodesk.Viewing.Initializer(options, function () {
    loadModel();
});

function loadModel() {
    const htmlDiv = document.getElementById('viewer');
    const config = {
        disabledExtensions: {
            measure: true
        }
    };

    viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv, config);
    const startedCode = viewer.start();
    if (startedCode > 0) {
        console.error('Failed to create a Viewer: WebGL not supported.');
        return;
    }

    console.log('Initialization complete, loading a model next...');
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (e) => {
        viewer.setLightPreset(8);
    })

    viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, onToolBarCreated)

    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
}

function onLoadModelSuccess(model) {
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (e) => {
        viewer.setLightPreset(8);
    });
}

function onLoadModelError(viewerErrorCode) {
    console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
}

function onDocumentLoadSuccess(doc) {
    const defaultModel = doc.getRoot().getDefaultGeometry();
    viewer.loadDocumentNode(doc, defaultModel);
}

function onDocumentLoadFailure() {
    console.error('Failed fetching Forge manifest');
}

function onToolBarCreated() {
    const toolbar = viewer.toolbar;
    toolbar._controls.forEach((c) => {
        if (c.getId() !== "modelTools") {
            c.setDisplay('none');
        }
    });
}


