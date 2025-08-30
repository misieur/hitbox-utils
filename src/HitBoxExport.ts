import {modelFormat} from "./HitBox-Utils";

let button: Action | undefined;

const exportDialog: Dialog = new Dialog({
    id: 'hitbox_export_dialog',
    title: 'Export HitBox',
    form: {
        format: {
            label: 'Export Format',
            type: 'select',
            default: 'itemsadder',
            options: {
                'itemsadder': 'ItemsAdder (only barrier block models)'
            }
        }
    },
    onConfirm(form) {
        switch (form.format) {
            case 'itemsadder': {
                Blockbench.showStatusMessage("Exporting HitBox...", 2000);
                Blockbench.setProgress(0);
                if (Project?.format !== modelFormat || (Project as any).hitbox_type !== 'block') {
                    Blockbench.showMessageBox({
                        title: "Invalid Model",
                        message: "The model has to be a Barrier Block HitBox model",
                    })
                    return;
                }
                if (!Cube.all.length) {
                    Blockbench.showMessageBox({title: "Error", message: "No cubes found."});
                    return;
                }
                Blockbench.setProgress(0.25);

                let minX = 160, minY = 160, minZ = 160; // 10 blocks max
                let maxX = -160, maxY = -160, maxZ = -160;

                Cube.all.forEach((cube: Cube) => {
                    minX = Math.min(minX, cube.from[0]);
                    minY = Math.min(minY, cube.from[1]);
                    minZ = Math.min(minZ, cube.from[2]);
                    maxX = Math.max(maxX, cube.to[0]);
                    maxY = Math.max(maxY, cube.to[1]);
                    maxZ = Math.max(maxZ, cube.to[2]);
                });
                Blockbench.setProgress(0.75);

                const length = (maxZ - minZ) / 16;
                const width = (maxX - minX) / 16;
                const height = (maxY - minY) / 16;

                const length_offset = (minZ / 16) + length / 2 - 0.5;
                const width_offset = (minX / 16) + width / 2 - 0.5;
                const height_offset = (minY / 16) + height / 2 - 0.5;

                const yaml = "hitbox:\n" +
                    "  length: " + length + "\n" +
                    "  width: " + width + "\n" +
                    "  height: " + height + "\n" +
                    "  length_offset: " + length_offset + "\n" +
                    "  width_offset: " + width_offset + "\n" +
                    "  height_offset: " + height_offset + "\n";

                Blockbench.setProgress(1);
                Blockbench.showMessageBox({
                    title: "Exported HitBox YAML",
                    message: "Copy the following YAML to your ItemsAdder item config:\n```YAML\n" + yaml + "\n```",
                });

            }
        }
    }
})

export function createExportButton() {
    if (button) return;
    button = new Action('hitbox_export', {
        name: 'Export HitBox',
        description: 'Export an HitBox model for different hitbox formats',
        click() {
            exportDialog.show();
        }
    });
    MenuBar.menus.tools.addAction(button);
}

export function removeExportButton() {
    if (button) {
        console.log(MenuBar.menus.tools.structure);
        MenuBar.removeAction('tools');
        console.log(MenuBar.menus.tools.structure);
        button.delete();
        button = undefined;
    }
}