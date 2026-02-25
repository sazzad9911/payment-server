"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Capitalize the first letter of the module name
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
// Function to generate a comment based on the file name
function getFileComment(fileName) {
    const baseName = path_1.default.basename(fileName, path_1.default.extname(fileName)); // Get the name without extension
    switch (baseName) {
        case "controller":
            return `// ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}: Handles HTTP requests for the ${baseName} module.`;
        case "service":
            return `// ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}: Contains business logic for the ${baseName} module.`;
        case "routes":
            return `// ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}: Defines the routes and endpoint handlers for the ${baseName} module.`;
        case "validation":
            return `// ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}: Contains validation logic for inputs in the ${baseName} module.`;
        case "interface":
            return `// ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}: Defines the interfaces and types for the ${baseName} module.`;
        default:
            return `// ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}: Module file for the ${baseName} functionality.`;
    }
}
// Main function to create module directory and files
function createModule(moduleName) {
    return __awaiter(this, void 0, void 0, function* () {
        const capitalizedModuleName = capitalize(moduleName);
        // Fix the base path to your project's root directory
        const projectRoot = path_1.default.resolve(__dirname, ".."); // Adjust this based on where your script is
        const moduleDir = path_1.default.join(projectRoot, "src", "app", "modules", capitalizedModuleName);
        // Check if the module directory already exists
        if (fs_1.default.existsSync(moduleDir)) {
            console.log(`Module "${capitalizedModuleName}" already exists.`);
            return;
        }
        // Create the module directory
        fs_1.default.mkdirSync(moduleDir, { recursive: true });
        // Files to create in the new module folder
        const filesToCreate = [
            `${capitalizedModuleName}.controller.ts`,
            `${capitalizedModuleName}.service.ts`,
            `${capitalizedModuleName}.routes.ts`,
            `${capitalizedModuleName}.validation.ts`,
            `${capitalizedModuleName}.interface.ts`,
        ];
        // Create each file with a comment based on the file name
        for (const fileName of filesToCreate) {
            const filePath = path_1.default.join(moduleDir, fileName);
            const comment = getFileComment(fileName);
            fs_1.default.writeFileSync(filePath, `${comment}\n`); // Write comment as the content of the file
        }
        console.log(`Module "${capitalizedModuleName}" with commented files created successfully.`);
    });
}
// Parse command-line arguments to get the module name
const args = process.argv.slice(2);
if (args.length < 1) {
    console.log("Please provide a module name. Usage: npm run generate <moduleName>");
    process.exit(1);
}
const moduleName = args[0];
createModule(moduleName);
