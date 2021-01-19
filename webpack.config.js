module.exports = {
    entry: __dirname + "/public/scripts/main.js", // webpack entry point. Module to start building dependency graph
    output: {
        path: __dirname + '/public/scripts', // Folder to store generated bundle
        filename: 'bundle.js',  // Name of generated bundle after build
    }
}