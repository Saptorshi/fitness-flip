const { FlipFitApp } = require('./app');
const { CLIHandler } = require('./cli/CLIHandler');

const app = new FlipFitApp();
const cli = new CLIHandler(app);

cli.start();