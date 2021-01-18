import { initGame } from "./game.js";
/* const options = {
    env: 'AutodeskProduction',
    api: 'derivativeV2',  // for models uploaded to EMEA change this option to 'derivativeV2_EU'
    getAccessToken: getForgeToken,
} */
let viewer;
const documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cGFjbWFuLWZvcmdlL2N1YmVWMi5pcHQ';
//dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cGFjbWFuLWZvcmdlL0NVQkVfdjAuaXB0
//dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cGFjbWFuLWZvcmdlL2N1YmUuaXB0
document.addEventListener('DOMContentLoaded', function() {
    launchViewer();
});

function getForgeToken(onTokenReady) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/oauth', false);
    xhr.send();
    if (xhr.status != 200) {
        alert(xhr.status + ': ' + xhr.statusText);
    } else {
        let data = JSON.parse(xhr.responseText);
        const token = data.access_token;
        const timeInSeconds = data.expires_in;
        onTokenReady(token, timeInSeconds);
    }
}

function launchViewer() {
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getForgeToken
    };
    const config = {
        extensions: ['Autodesk.ViewCubeUi']
            /* disabledExtensions: {
                measure: true
            } */
    };

    Autodesk.Viewing.Initializer(options, () => {
        viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('viewer'), config);
        viewer.start();
        viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, onToolBarCreated)
        viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function() {
            const tree = viewer.model.getInstanceTree();
            const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
            material.side = THREE.DoubleSide;
            const materialManager = viewer.impl.matman();
            materialManager.addMaterial('myCustomMaterial', material, true);
            const model = viewer.model;
            model.unconsolidate(); // If the model is consolidated, material changes won't have any effect
            const frags = model.getFragmentList();
            const dbids = [0, 3];
            for (const dbid of dbids) {
                tree.enumNodeFragments(dbid, (fragid) => {
                    frags.setMaterial(fragid, material);
                });
            }
            viewer.impl.invalidate(true);
            viewer.setOptimizeNavigation(true);
            viewer.setQualityLevel(true, true);
            viewer.setProgressiveRendering(false);

            viewer.setLightPreset(6); //4,6,9
            viewer.setBackgroundColor(0, 0, 0, 0, 0, 0);
        });
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

function onDocumentLoadSuccess(doc) {
    var viewables = doc.getRoot().getDefaultGeometry();
    viewer.loadDocumentNode(doc, viewables).then(i => {
        let cubeExt = viewer.getExtension('Autodesk.ViewCubeUi');
        cubeExt.setViewCube('front');
        cubeExt.showTriad(true);
        cubeExt.setVisible(false);

        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (e) => {
            //viewer.setBackgroundColor(60, 60, 60, 60, 60, 60); //fix
            viewer.setQualityLevel(true, true);
            viewer.setGhosting(true);
            viewer.setGroundShadow(false);
            viewer.setGroundReflection(false);
            viewer.setProgressiveRendering(true);

            disableEventsEvents();
            zoomCamera();
            initGame();
        });
    });
}

function zoomCamera() {
    let camera = viewer.navigation.getCamera();
    camera.zoom = 1.1;
    viewer.navigation.updateCamera();
}

function disableEventsEvents() {
    let config = {
        "click": {
            "onObject": ['selectToggle'],
            "offObject": ['deselectAll']
        },
        "disableMouseWheel": true,
        "disableMouseMove": true
    };
    viewer.setCanvasClickBehavior(config);
    viewer.clickHandler.handleDoubleClick = (e) => {
        return;
    }
    for (const tool of viewer.toolController.getToolNames()) {
        viewer.toolController.deactivateTool(tool);
    }
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onToolBarCreated() {
    const toolbar = viewer.toolbar;
    toolbar._controls.forEach((c) => {
        c.setDisplay('none');
    });
}