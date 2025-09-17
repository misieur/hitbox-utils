import {version} from './HitBox-Utils';

export class HitBoxCodecOptions implements CodecOptions {
    extension: string = "hitbox";
    name: string = "HitBox";
    remember: boolean = true;
    load_filter: { extensions: string[], type: 'json' | 'text', condition?: ConditionResolvable } = {
        extensions: ['hitbox'],
        type: 'json',
    }

    compile(): string {
        if (!Project) throw new Error('No project to compile.');
        let hitboxes, type;
        if ((Project as any).hitbox_type === "entity") {
            hitboxes = Cube.all.map((cube: Cube) => {
                if (!(cube as any).is_shulker_only) {
                    const from: number[] = cube.from;
                    const to: number[] = cube.to;
                    const size: number = (to[0] - from[0]) / 16;
                    return {
                        position: {x: from[0] / 16 + size / 2, y: from[1] / 16, z: from[2] / 16 + size / 2},
                        size: size
                    };
                } else {
                    const from: number[] = cube.from;
                    const to: number[] = cube.to;
                    const size: number[] = [
                        (to[0] - from[0]) / 16,
                        (to[1] - from[1]) / 16,
                        (to[2] - from[2]) / 16
                    ];
                    let width: number, height: number, face: number;
                    if (size[0] === size[2]) {
                        face = 0;
                        width = size[0];
                        height = Math.round(-size[1] / width * 100 + 100);
                        return {
                            position: {x: from[0] / 16 + width / 2, y: from[1] / 16, z: from[2] / 16 + width / 2},
                            size: width,
                            height: height,
                            face: face,
                            shulker_only: true
                        };
                    } else if (size[0] === size[1]) {
                        face = 3;
                        width = size[0];
                        height = Math.round(-size[2] / width * 100 + 100);
                        return {
                            position: {x: from[0] / 16 + width / 2, y: from[1] / 16, z: from[2] / 16 + width / 2},
                            size: width,
                            height: height,
                            face: face,
                            shulker_only: true
                        };
                    } else {
                        face = 5;
                        width = size[1];
                        height = Math.round(-size[0] / width * 100 + 100);
                        return {
                            position: {x: from[0] / 16 + width / 2, y: from[1] / 16, z: from[2] / 16 + width / 2},
                            size: width,
                            height: height,
                            face: face,
                            shulker_only: true
                        };
                    }
                }
            });
            type = "entity";
        } else if ((Project as any).hitbox_type === "block") {
            hitboxes = Cube.all.map((cube: Cube) => {
                const from: number[] = cube.from;
                return {
                    position: {
                        x: Math.round(from[0] / 16),
                        y: Math.round(from[1] / 16),
                        z: Math.round(from[2] / 16)
                    }
                };
            });
            type = "block";
        } else if ((Project as any).hitbox_type === "interaction") {
            hitboxes = Cube.all.map((cube: Cube) => {
                const from: number[] = cube.from;
                const width: number = (cube.to[0] - from[0]) / 16;
                return {
                    position: {x: from[0] / 16 + width / 2, y: from[1] / 16, z: from[2] / 16 + width / 2},
                    width: width,
                    height: (cube.to[1] - from[1]) / 16
                };
            });
            type = "interaction";
        } else throw new Error("Invalid HitBox type");
        return JSON.stringify({version: version, hitboxes, type: type}, null, 2);
    }

    export(): void {
        if (!Project) throw new Error('No project to export.');
        Blockbench.export({
                name: (Project.name.toLowerCase().replace(/ /g, "_") || this.fileName()),
                startpath: Project.save_path,
                type: 'json',
                extensions: [this.extension],
                content: this.compile()
            }, () => {
                if (!Project) return;
                Project.saved = true;
            }
        )
    }

    fileName(): string {
        return "hitbox";
    }

    load(model: any, file: FileResult): void {
        setupProject("hitbox");
        addRecentProject(file);
        this.parse(model);
    }

    parse(data: any): void {
        if (data.type !== "entity" && data.type !== "block" && data.type !== "interaction") {
            throw new Error("Invalid HitBox type");
        }

        const hitboxes = data.hitboxes;
        if (!Array.isArray(hitboxes)) {
            throw new Error("HitBox data is not an array");
        }

        (Project as any).hitbox_type = data.type;

        if (Project?.view_mode) {
            Project.view_mode = "wireframe";
            if (data.type === 'entity') {
                Project.name = 'Entity HitBox';
                hitboxes.forEach((hitbox: any) => {
                    if (!hitbox.shulker_only) {
                        const from: [number, number, number] = [
                            hitbox.position.x * 16 - hitbox.size * 8,
                            hitbox.position.y * 16,
                            hitbox.position.z * 16 - hitbox.size * 8
                        ];
                        const to: [number, number, number] = [
                            from[0] + hitbox.size * 16,
                            from[1] + hitbox.size * 16,
                            from[2] + hitbox.size * 16
                        ];
                        const cube: Cube = new Cube({from: from, to: to});
                        cube.init();
                        cube.setColor(0);
                    } else {
                        let from: [number, number, number], to: [number, number, number];
                        const width = hitbox.size;
                        const hPercent = hitbox.height;
                        if (hitbox.face === 0) {
                            const sizeY = width * (100 - hPercent) / 100;
                            from = [
                                hitbox.position.x * 16 - (width * 8),
                                hitbox.position.y * 16,
                                hitbox.position.z * 16 - (width * 8)
                            ];
                            to = [
                                from[0] + width * 16,
                                from[1] + sizeY * 16,
                                from[2] + width * 16
                            ];
                        } else if (hitbox.face === 3) {
                            const sizeZ = width * (100 - hPercent) / 100;
                            from = [
                                hitbox.position.x * 16 - (width * 8),
                                hitbox.position.y * 16,
                                hitbox.position.z * 16 - (width * 8)
                            ];
                            to = [
                                from[0] + width * 16,
                                from[1] + width * 16,
                                from[2] + sizeZ * 16
                            ];
                        } else {
                            const sizeX = width * (100 - hPercent) / 100;
                            from = [
                                hitbox.position.x * 16 - (width * 8),
                                hitbox.position.y * 16,
                                hitbox.position.z * 16 - (width * 8)
                            ];
                            to = [
                                from[0] + sizeX * 16,
                                from[1] + width * 16,
                                from[2] + width * 16
                            ];
                        }
                        const cube: Cube = new Cube({from, to});
                        cube.init();
                        cube.setColor(0);
                        (cube as any).is_shulker_only = true;
                        cube.name = "shulker only cube";
                    }
                })
            } else if (data.type === 'block') {
                Project.name = 'Barrier Block HitBox';
                hitboxes.forEach((hitbox: any) => {
                    const from: [number, number, number] = [
                        hitbox.position.x * 16,
                        hitbox.position.y * 16,
                        hitbox.position.z * 16
                    ];
                    const to: [number, number, number] = [
                        from[0] + 16,
                        from[1] + 16,
                        from[2] + 16
                    ];
                    const cube: Cube = new Cube({from: from, to: to});
                    cube.init();
                    cube.setColor(0);
                })
            } else if (data.type === 'interaction') {
                Project.name = 'Interaction Entity HitBox';
                hitboxes.forEach((hitbox: any) => {
                    const from: [number, number, number] = [
                        hitbox.position.x * 16 - hitbox.width * 8,
                        hitbox.position.y * 16,
                        hitbox.position.z * 16 - hitbox.width * 8
                    ];
                    const to: [number, number, number] = [
                        from[0] + hitbox.width * 16,
                        from[1] + hitbox.height * 16,
                        from[2] + hitbox.width * 16
                    ];
                    const cube: Cube = new Cube({from: from, to: to});
                    cube.init();
                    cube.setColor(0);
                })
            }
        }

        Canvas.updateView({elements: Cube.all, selection: true});

    }

}
