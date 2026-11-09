# render quick-look PNGs of the built car (studio light). exec'd from build_meshy_falcon.py when a render dir is given.
sc=bpy.context.scene;sc.render.engine="CYCLES";sc.cycles.samples=int(os.environ.get("RS","64"));sc.cycles.use_denoising=False;sc.view_settings.view_transform="Filmic"
sc.render.resolution_x=1400;sc.render.resolution_y=800
if not sc.world or sc.world.name!="studio":
    w=bpy.data.worlds.new("studio");sc.world=w;w.use_nodes=True;nt=w.node_tree
    bg=nt.nodes["Background"];tc=nt.nodes.new("ShaderNodeTexCoord");mp=nt.nodes.new("ShaderNodeMapping");gr=nt.nodes.new("ShaderNodeValToRGB")
    sp=nt.nodes.new("ShaderNodeSeparateXYZ");nt.links.new(tc.outputs["Generated"],sp.inputs[0])
    gr.color_ramp.elements[0].position=.42;gr.color_ramp.elements[0].color=(.23,.23,.25,1);gr.color_ramp.elements[1].position=.75;gr.color_ramp.elements[1].color=(1.1,1.1,1.15,1)
    nt.links.new(sp.outputs[2],gr.inputs[0]);nt.links.new(gr.outputs[0],bg.inputs[0]);bg.inputs[1].default_value=1.
    s=bpy.data.lights.new("s","SUN");s.energy=3.5;s.angle=.3;so=bpy.data.objects.new("s",s);sc.collection.objects.link(so);so.rotation_euler=(.85,.2,.7)
    mg=bpy.data.materials.new("gd");mg.use_nodes=True;mg.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value=(.3,.3,.32,1);mg.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value=.3
    pm=bpy.data.meshes.new("gd");pm.from_pydata([(-20,-20,0),(20,-20,0),(20,20,0),(-20,20,0)],[],[[0,1,2,3]]);pm.materials.append(mg);po=bpy.data.objects.new("gd",pm);sc.collection.objects.link(po)
cam=bpy.data.cameras.new("c");cam.lens=70;co=bpy.data.objects.new("c",cam);sc.collection.objects.link(co);sc.camera=co
ANG={"q_front":(5.2,-6.3,2.0),"q_rear":(-5.2,7.0,2.1),"chase":(-1.6,8.0,3.2),"side":(9.,.1,1.1),"top_rear":(0,5.,5.5),"front":(2.3,-8.8,1.15)}
target=Vector((0,0,.55))
for n,d in ANG.items():
    d=Vector(d);fw=(target-d).normalized();co.location=d;co.rotation_euler=fw.to_track_quat("-Z","Y").to_euler()
    sc.render.filepath=os.path.join(RENDER,n+".png");bpy.ops.render.render(write_still=True);log("render",n)
