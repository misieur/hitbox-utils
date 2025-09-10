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
                'itemsadder': 'ItemsAdder (only barrier block models)',
                'craftengine': 'CraftEngine (entity and interaction models)',
            }
        }
    },
    onConfirm(form) {
        switch (form.format) {
            case 'itemsadder': {
                Blockbench.setStatusBarText("Exporting HitBox...");
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
                }, () => {
                    Blockbench.setProgress(0);
                });
            } case 'craftengine': {
                Blockbench.setStatusBarText("Exporting HitBox...");
                Blockbench.setProgress(0);
                if (Project?.format !== modelFormat || ((Project as any).hitbox_type !== 'entity' && ((Project as any).hitbox_type !== 'interaction'))) {
                    Blockbench.showMessageBox({
                        title: "Invalid Model",
                        message: "The model has to be an Entity or Interaction model",
                    })
                    return;
                }
                if (!Cube.all.length) {
                    Blockbench.showMessageBox({title: "Error", message: "No cubes found."});
                    return;
                }
                Blockbench.setProgress(0.25);
                let yaml: string = "hitboxes:\n";
                if ((Project as any).hitbox_type === 'entity') {
                    Cube.all.forEach((cube: Cube) => {
                        if (!(cube as any).is_shulker_only) {
                            const from: number[] = cube.from;
                            const to: number[] = cube.to;
                            const size: number = (to[0] - from[0]) / 16;
                            yaml += "- type: happy_ghast\n" +
                                "  position: " + (from[0] / 16 + size / 2 - 0.5) + "," + (from[1] / 16) + "," + (from[2] / 16 + size / 2 - 0.5) + "\n" +
                                "  scale: " + size + "\n";

                        } else {
                            const from: number[] = cube.from;
                            const to: number[] = cube.to;
                            const size: number[] = [
                                (to[0] - from[0]) / 16,
                                (to[1] - from[1]) / 16,
                                (to[2] - from[2]) / 16
                            ];
                            let width: number, height: number;
                            if (size[0] === size[2]) {
                                width = size[0];
                                height = Math.round(-size[1] / width * 100 + 100);
                                yaml += "- type: shulker\n" +
                                    "  position: " + (from[0] / 16 + width / 2 - 0.5) + "," + (from[1] / 16) + "," + (from[2] / 16 + width / 2 - 0.5) + "\n" +
                                    "  scale: " + width + "\n" +
                                    "  peek: " + height + "\n" +
                                    "  direction: DOWN\n";
                            } else if (size[0] === size[1]) {
                                width = size[0];
                                height = Math.round(-size[2] / width * 100 + 100);
                                yaml += "- type: shulker\n" +
                                    "  position: " + (from[0] / 16 + width / 2 - 0.5) + "," + (from[1] / 16) + "," + (from[2] / 16 - 0.5 + width / 2) + "\n" +
                                    "  scale: " + width + "\n" +
                                    "  peek: " + height + "\n" +
                                    "  direction: NORTH\n";
                            } else {
                                width = size[1];
                                height = Math.round(-size[0] / width * 100 + 100);
                                yaml += "- type: shulker\n" +
                                    "  position: " + (from[0] / 16 - 0.5 + width / 2) + "," + (from[1] / 16) + "," + (from[2] / 16 + width / 2 - 0.5) + "\n" +
                                    "  scale: " + width + "\n" +
                                    "  peek: " + height + "\n" +
                                    "  direction: WEST\n";
                            }
                        }
                    });
                } else if ((Project as any).hitbox_type === 'interaction') {
                    Cube.all.forEach((cube: Cube) => {
                        const from: number[] = cube.from;
                        const width: number = (cube.to[0] - from[0]) / 16;
                        yaml += "- type: interaction\n" +
                            "  position: " + (from[0] / 16 + width / 2 - 0.5) + "," + (from[1] / 16) + "," + (from[2] / 16 + width / 2 - 0.5) + "\n" +
                            "  width: " + width + "\n" +
                            "  height: " + (cube.to[1] - from[1]) / 16 + "\n";
                    });
                }

                Blockbench.setProgress(1);
                Blockbench.showMessageBox({
                    title: "Exported HitBox YAML",
                    message: "Copy the following YAML to your CraftEngine Furniture config:\n```YAML\n" + yaml + "\n```",
                }, () => {
                    Blockbench.setProgress(0);
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
