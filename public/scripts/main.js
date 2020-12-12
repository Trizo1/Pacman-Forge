
/* const options = {
    env: 'AutodeskProduction',
    api: 'derivativeV2',  // for models uploaded to EMEA change this option to 'derivativeV2_EU'
    getAccessToken: getForgeToken,
} */
$("#viewer").click(function () {
    NOP_VIEWER.getProperties(NOP_VIEWER.getSelection(), data => console.log(data))
});
let viewer;
const documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cGFjbWFuLWZvcmdlL2N1YmUuaXB0';

$(document).ready(function () {
    launchViewer();
});

function getForgeToken(onTokenReady) {
    $.get("/oauth", (data) => {
        const token = data.access_token;
        const timeInSeconds = data.expires_in;
        onTokenReady(token, timeInSeconds);
    });
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
        viewer = new Autodesk.Viewing.Viewer3D(document.getElementById('viewer'), config);
        viewer.start();
        //viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, onToolBarCreated)
        viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function () {
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
        });
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

function onDocumentLoadSuccess(doc) {
    var viewables = doc.getRoot().getDefaultGeometry();
    viewer.loadDocumentNode(doc, viewables).then(i => {
        let cubeExt = viewer.getExtension('Autodesk.ViewCubeUi');
        cubeExt.setViewCube('front');
        //cubeExt.displayViewCube(false);
        cubeExt.setVisible(false);

        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (e) => {
            viewer.setBackgroundColor(40, 40, 40, 40, 40, 40); //fix
            viewer.setQualityLevel(true, true);
            viewer.setGhosting(true);
            viewer.setGroundShadow(false);
            viewer.setGroundReflection(false);
            viewer.setProgressiveRendering(true);

            disableEventsEvents();
        });
    });
}

function disableEventsEvents() {
    let config = {
        "click": {
            "onObject": ['selectToggle'],
            "offObject": ['deselectAll']
        },
        "disableMouseWheel": true
    };
    viewer.setCanvasClickBehavior(config);
    viewer.clickHandler.handleDoubleClick = (e) => {
        return;
    }
    //viewer.toolController.deactivateTool('orbit');
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onToolBarCreated() {
    const toolbar = viewer.toolbar;
    toolbar._controls.forEach((c) => {
        if (c.getId() !== "modelTools") {
            c.setDisplay('none');
        }
    });
}