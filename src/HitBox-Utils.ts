import {HitBoxCodecOptions} from "./HitBoxCodecOptions";
import ModelFormat = Blockbench.ModelFormat;
import ModelProject = Blockbench.ModelProject;
import Cube = Blockbench.Cube;
import {createExportButton, removeExportButton} from "./HitBoxExport";

export let modelFormat: ModelFormat;
let codec: Codec, dialog: Dialog, shulkerDialog: Dialog;
export const version = '1.1.0';

BBPlugin.register('hitbox-utils', {
    title: 'Hitbox Utils',
    author: 'Misieur',
    icon: 'icon',
    description: 'Create and edit HitBoxes in Blockbench',
    version: version,
    variant: 'both',
    repository: "https://github.com/misieur/hitbox-utils",
    website: 'https://discord.gg/5VSeDcyJt7',
    onload() {
        dialog = new Dialog({
            id: 'hitbox_utils_dialog',
            title: 'Create a new HitBox',
            form: {
                hitbox_type: {
                    label: 'HitBox Type',
                    type: 'select',
                    default: 'entity',
                    options: {
                        'entity': 'Entity - Cubic Hitboxes',
                        'block': 'Barrier - Block Hitboxes',
                        'interaction': 'Interaction Entity - Right Square Prism Non-solid Hitboxes'
                    },
                    description: "Entity type uses shulker or happy ghast\n" +
                        "Barrier type uses barrier blocks\n" +
                        "Interaction Entity type uses interaction entities"
                }
            },
            onConfirm(formData) {
                (Project as any).hitbox_type = formData.hitbox_type;
                if (Project?.name) {
                    if (formData.hitbox_type === 'entity') {
                        Project.name = 'Entity HitBox';
                    } else if (formData.hitbox_type === 'block') {
                        Project.name = 'Barrier Block HitBox';
                    } else if (formData.hitbox_type === 'interaction') {
                        Project.name = 'Interaction Entity HitBox';
                    }
                }
            }
        });
        codec = new Codec("hitbox", new HitBoxCodecOptions());
        modelFormat = new ModelFormat("hitbox", {
            id: 'hitbox',
            name: 'HitBox',
            description: 'A HitBox model',
            animation_mode: false,
            display_mode: false,
            paint_mode: false,
            pose_mode: false,
            meshes: false,
            texture_meshes: false,
            rotate_cubes: false,
            texture_folder: false,
            onSetup(project: ModelProject, newModel?: boolean) {
                if (!newModel) return;
                const cube: Cube = new Cube({from: [0, 0, 0], to: [16, 16, 16]});
                cube.init();
                cube.setColor(0);
                project.view_mode = "wireframe";
                project.name = "Entity HitBox";

                Canvas.updateView({elements: Cube.all, selection: true});
                createExportButton();
            },
            model_identifier: false,
            codec: codec
        });
        modelFormat.new = function () {
            newProject(this);

            if (dialog) {
                dialog.show();
            }
            return false;
        };
        new Property(ModelProject, 'string', 'hitbox_type', {
            default: "entity",
            values: ['entity', 'block', 'interaction'],
            condition: {formats: [modelFormat.id]}
        });
        new Property(Cube, 'boolean', 'is_shulker_only', {
            default: false,
            condition: {formats: [modelFormat.id]}
        });
        Blockbench.addListener<EventName>('finish_edit', data => {
            if (Project?.format.id === "hitbox") {
                if ((Project as any).hitbox_type === 'entity') {
                    data.aspects.elements.forEach((cube: Cube) => {
                        if ((cube as any).is_shulker_only) {
                            const from = [...cube.from] as [number, number, number];
                            const to = [...cube.to] as [number, number, number];
                            const size: [number, number, number] = [
                                to[0] - from[0],
                                to[1] - from[1],
                                to[2] - from[2]
                            ];

                            if (size[0] === size[1]) {
                                if (size[2] >= size[0] && size[2] <= size[0] * 2) return;
                                size[2] = Math.max(Math.min(size[0] * 2, size[2]), size[0]);
                            } else if (size[0] === size[2]) {
                                if (size[1] >= size[0] && size[1] <= size[0] * 2) return;
                                size[1] = Math.max(Math.min(size[0] * 2, size[1]), size[0]);
                            } else if (size[1] === size[2]) {
                                if (size[1] >= size[0] && size[1] <= size[0] * 2) return;
                                size[0] = Math.max(Math.min(size[2] * 2, size[0]), size[2]);
                            } else if (Math.abs(size[0] - size[1]) < Math.abs(size[1] - size[2]) && Math.abs(size[0] - size[1]) < Math.abs(size[0] - size[2])) {
                                const width: number = (size[0] + size[1]) / 2;
                                size[0] = width;
                                size[1] = width;
                                size[2] = Math.min(Math.max(width * 2, size[2]), width);
                            } else if (Math.abs(size[1] - size[2]) < Math.abs(size[0] - size[1]) && Math.abs(size[1] - size[2]) < Math.abs(size[0] - size[2])) {
                                const width: number = (size[1] + size[2]) / 2;
                                size[1] = width;
                                size[2] = width;
                                size[0] = Math.min(Math.max(width * 2, size[0]), width);
                            } else {
                                const width: number = (size[0] + size[2]) / 2;
                                size[0] = width;
                                size[2] = width;
                                size[1] = Math.min(Math.max(width * 2, size[1]), width);
                            }

                            cube.from = from;
                            cube.to = [
                                from[0] + size[0],
                                from[1] + size[1],
                                from[2] + size[2]
                            ];

                            Canvas.updateView({
                                elements: [cube],
                                element_aspects: {geometry: true},
                                selection: true
                            });
                            return;
                        }
                        const from = [...cube.from] as [number, number, number];
                        const to = [...cube.to] as [number, number, number];
                        const size: [number, number, number] = [
                            to[0] - from[0],
                            to[1] - from[1],
                            to[2] - from[2]
                        ];
                        if (size[0] === size[1] && size[1] === size[2]) return;
                        if (size[0] === size[1] && size[0] !== size[2]) {
                            size[0] = size[2];
                            size[1] = size[2];
                        } else if (size[0] === size[2] && size[0] !== size[1]) {
                            size[0] = size[1];
                            size[2] = size[1];
                        } else {
                            size[1] = size[0];
                            size[2] = size[0];
                        }
                        from[0] = Math.roundTo(from[0], 1);
                        from[1] = Math.roundTo(from[1], 1);
                        from[2] = Math.roundTo(from[2], 1);
                        cube.from = from;
                        cube.to = [
                            from[0] + size[0],
                            from[1] + size[1],
                            from[2] + size[2]
                        ];
                        Canvas.updateView({
                            elements: [cube],
                            element_aspects: {geometry: true},
                            selection: true
                        });
                    })
                } else if ((Project as any).hitbox_type === 'block') {
                    data.aspects.elements.forEach((cube: Cube) => {
                        const from = [...cube.from] as [number, number, number];
                        const to = [...cube.to] as [number, number, number];
                        if (from[0] % 16 === 0 && from[1] % 16 === 0 && from[2] % 16 === 0 && to[0] === from[0] + 16 && to[1] === from[1] + 16 && to[2] === from[2] + 16) return;
                        Math.roundTo(from[0], 1);
                        Math.roundTo(from[1], 1);
                        Math.roundTo(from[2], 1);

                        from[0] = Math.round(from[0] / 16) * 16;
                        from[1] = Math.round(from[1] / 16) * 16;
                        from[2] = Math.round(from[2] / 16) * 16;
                        cube.from = from;
                        cube.to = [
                            from[0] + 16,
                            from[1] + 16,
                            from[2] + 16
                        ];

                        Canvas.updateView({
                            elements: [cube],
                            element_aspects: {geometry: true},
                            selection: true
                        });
                    })
                } else if ((Project as any).hitbox_type === 'interaction') {
                    data.aspects.elements.forEach((cube: Cube) => {
                        const from = [...cube.from] as [number, number, number];
                        const to = [...cube.to] as [number, number, number];
                        const size: [number, number] = [
                            to[0] - from[0],
                            to[2] - from[2]
                        ];
                        if (size[0] === size[1]) return;
                        const width = (size[0] + size[1]) / 2;
                        cube.from[0] = Math.roundTo(from[0], 1);
                        cube.from[2] = Math.roundTo(from[2], 1);
                        cube.to[0] = Math.roundTo(from[0] + width, 1);
                        cube.to[2] = Math.roundTo(from[2] + width, 1);
                        cube.getUndoCopy()
                        Canvas.updateView({
                            elements: [cube],
                            element_aspects: {geometry: true},
                            selection: true
                        });
                    })
                }
            }
        });
        shulkerDialog = new Dialog({
            id: 'shulker_only_dialog',
            title: 'Shulker Only',
            form: {
                is_shulker_only: {
                    label: 'Make this cube shulker only?',
                    type: 'checkbox',
                    description: "If enabled the cube will use shulkers only, will support height, width and face direction but will not be compatible with happy ghast and also more laggy.",
                    default: false
                }
            }
        });
        Blockbench.addListener<EventName>("add_cube", data => {
            if (Project?.format.id === "hitbox") {
                if ((Project as any).hitbox_type === 'entity') {
                    shulkerDialog.onConfirm = (formData) => {
                        (data.object as any).is_shulker_only = formData.is_shulker_only;
                        if (formData.is_shulker_only) {
                            data.object.name = "shulker only cube";
                        }
                    };
                    shulkerDialog.show();
                    data.object.from = [2, 2, 2]
                    data.object.to = [14, 14, 14]
                    Canvas.updateView({elements: [data.object], selection: true});
                }
            }
        });
        Blockbench.addListener<EventName>('select_project', data => {
            if (data.project.format === modelFormat) {
                createExportButton();
            } else {
                removeExportButton();
            }
        });

        Blockbench.addListener<EventName>('close_project', () => {
            removeExportButton();
        });
    },
    onunload() {
        modelFormat.delete();
        codec.delete();
        Blockbench.removeListener<EventName>('finish_edit', () => {
        });
        Blockbench.removeListener<EventName>('add_cube', () => {
        });
    }

});
