# bakes one greyscale map (ambient occlusion x shut lines) onto paint/stripe/carbon. exec'd from build_meshy_falcon.py.
import numpy as np
bpy.context.view_layer.objects.active = ob
for o_ in bpy.data.objects: o_.select_set(False)
ob.select_set(True)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(58), island_margin=.003, area_weight=.3, correct_aspect=True, scale_to_bounds=False)
bpy.ops.object.mode_set(mode="OBJECT")
# decal faces keep their planar UV (re-applied, smart_project overwrote them)
uvd = m.uv_layers["UVMap"].data
dec_names = {}
for k_, dc in enumerate(DECALS): dec_names[dc.get("name") or ("decal" if k_ == 0 else f"decal{k_}")] = dc
matn = [x.name if x else "" for x in m.materials]
for p in m.polygons:
    dc = dec_names.get(matn[p.material_index])
    if not dc: continue
    rect = dc["rect"]; a0, a1 = min(rect[0], rect[2]), max(rect[0], rect[2]); b0, b1 = min(rect[1], rect[3]), max(rect[1], rect[3]); ax_ = dc["ax"]
    cx_ = sum((m.vertices[i].co for i in p.vertices), Vector()) / len(p.vertices)
    for li in p.loop_indices:
        v_ = m.vertices[m.loops[li].vertex_index].co; pp_ = proj(v_, ax_); u_ = (pp_[0] - a0) / (a1 - a0); v2_ = (pp_[1] - b0) / (b1 - b0)
        if dc.get("flipu") and dc["flipu"](None, cx_, p.normal, G(cx_)): u_ = 1 - u_
        uvd[li].uv = (u_, v2_)
# glass keeps planar UVs into meshy_glass.png: windscreen (top-left of the image), side glass (top-right), rear louvres (bottom-left), lamp housings (dark corner)
gl_idx = [x.name if x else "" for x in m.materials].index("glass")
for p in m.polygons:
    if p.material_index != gl_idx: continue
    cz = sum(-m.vertices[i].co.y for i in p.vertices) / len(p.vertices); side = abs(p.normal.x) > .55
    for li in p.loop_indices:
        v_ = m.vertices[m.loops[li].vertex_index].co; x_, y_, z_ = v_.x, v_.z, -v_.y
        if False: uvd[li].uv = (.97, .03)
        elif side: uvd[li].uv = (.5 + .5 * max(0, min(1, (z_ - GLASS_SIDE[0]) / GLASS_SIDE[1])), .5 + .5 * max(0, min(1, (y_ - GLASS_SIDE[2]) / GLASS_SIDE[3])))
        elif cz > GLASS_ZSPLIT: uvd[li].uv = (.5 * max(0, min(1, (x_ + GLASS_WIND[0]) / (2 * GLASS_WIND[0]))), .5 + .5 * max(0, min(1, 1 - (z_ - GLASS_WIND[1]) / GLASS_WIND[2])))
        elif GLASS_PLAIN_REAR: uvd[li].uv = (.97, .03)
        else: uvd[li].uv = (.5 * max(0, min(1, (x_ + GLASS_REAR[0]) / (2 * GLASS_REAR[0]))), .5 * max(0, min(1, (z_ - GLASS_REAR[1]) / GLASS_REAR[2])))
# shut lines: drawn into 2 projected images (side z/y, top x/z); value 1 = no line
def draw_lines(w_, h_, segs, fw):
    arr = np.ones((h_, w_), dtype=np.float32)
    for (x0_, y0_), (x1_, y1_) in segs:
        d_ = max(abs(x1_ - x0_), abs(y1_ - y0_)); n_ = max(2, int(d_ * 2))
        for t_ in np.linspace(0, 1, n_):
            x_ = int(round(x0_ + (x1_ - x0_) * t_)); y_ = int(round(y0_ + (y1_ - y0_) * t_))
            arr[max(0, y_ - fw):min(h_, y_ + fw + 1), max(0, x_ - fw):min(w_, x_ + fw + 1)] = .2
    return arr
SW, SH = 2600, 700   # side: z -2.6..2.6, y 0..1.4 (2mm/px)
ssp = lambda z_, y_: (SW * (z_ + 2.6) / 5.2, SH * (1 - y_ / 1.4))
TW, TH = 1300, 2600   # top: x -1.3..1.3, z -2.6..2.6 (2mm/px)
tsp = lambda x_, z_: (TW * (x_ + 1.3) / 2.6, TH * (1 - (z_ + 2.6) / 5.2))
def poly(pts, f_): return [(f_(*pts[i]), f_(*pts[i + 1])) for i in range(len(pts) - 1)]
side_lines = []
for L_ in SIDE_LINES: side_lines += poly(L_, ssp)
top_lines = []
for L_ in TOP_LINES: top_lines += poly(L_, tsp)
import zlib, struct
def write_png(path, arr):
    """8-bit grey PNG with no extra deps (a GENERATED Blender image loses pixels written from Python when saved or sampled by Cycles)"""
    h_, w_ = arr.shape; raw = b"".join(b"\x00" + bytes(row) for row in np.clip(arr * 255, 0, 255).astype(np.uint8))
    def ch(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    open(path, "wb").write(b"\x89PNG\r\n\x1a\n" + ch(b"IHDR", struct.pack(">IIBBBBB", w_, h_, 8, 0, 0, 0, 0)) + ch(b"IDAT", zlib.compress(raw, 6)) + ch(b"IEND", b""))
for name_, (w_, h_, segs, fw_) in {"pl_side": (SW, SH, side_lines, 2), "pl_top": (TW, TH, top_lines, 2)}.items():
    path_ = os.path.join(WORK, name_ + ".png"); write_png(path_, draw_lines(w_, h_, segs, fw_))
    img = bpy.data.images.load(path_, check_existing=False); img.name = name_; img.colorspace_settings.name = "Non-Color"
# bake on a temporary single-material copy (AO x lines, emission pass)
dup = ob.copy(); dup.data = m.copy(); bpy.context.scene.collection.objects.link(dup)
bk = bpy.data.materials.new("bk"); bk.use_nodes = True; nt_ = bk.node_tree
for n_ in list(nt_.nodes): nt_.nodes.remove(n_)
out_ = nt_.nodes.new("ShaderNodeOutputMaterial"); em_ = nt_.nodes.new("ShaderNodeEmission"); ao_ = nt_.nodes.new("ShaderNodeAmbientOcclusion"); ao_.samples = 24; ao_.inputs["Distance"].default_value = .5
geo_ = nt_.nodes.new("ShaderNodeNewGeometry"); sep_ = nt_.nodes.new("ShaderNodeSeparateXYZ"); nt_.links.new(geo_.outputs["Position"], sep_.inputs[0])
def proj_img(name_, uexpr):
    tx_ = nt_.nodes.new("ShaderNodeTexImage"); tx_.image = bpy.data.images[name_]; tx_.interpolation = "Linear"; tx_.extension = "EXTEND"
    cmb_ = nt_.nodes.new("ShaderNodeCombineXYZ")
    for ax_, (src_, mul_, add_) in zip("XY", uexpr):
        mth_ = nt_.nodes.new("ShaderNodeMath"); mth_.operation = "MULTIPLY_ADD"; mth_.inputs[1].default_value = mul_; mth_.inputs[2].default_value = add_
        nt_.links.new(sep_.outputs[src_], mth_.inputs[0]); nt_.links.new(mth_.outputs[0], cmb_.inputs[ax_])
    nt_.links.new(cmb_.outputs[0], tx_.inputs[0]); return tx_
ps_ = proj_img("pl_side", [("Y", -1 / 5.2, .5), ("Z", 1 / 1.4, 0.)])      # game z = -blender y
pt_ = proj_img("pl_top", [("X", 1 / 2.6, .5), ("Y", -1 / 5.2, .5)])       # top: x, game z = -blender y -> v = 1 - (z+2.6)/5.2 = (-z ... )
mul1 = nt_.nodes.new("ShaderNodeMath"); mul1.operation = "MULTIPLY"; mul2 = nt_.nodes.new("ShaderNodeMath"); mul2.operation = "MULTIPLY"
map_ = nt_.nodes.new("ShaderNodeMapRange"); map_.inputs["From Min"].default_value = 0; map_.inputs["From Max"].default_value = 1; map_.inputs["To Min"].default_value = .25; map_.inputs["To Max"].default_value = 1
nt_.links.new(ao_.outputs["Color"], map_.inputs["Value"]); nt_.links.new(map_.outputs[0], mul1.inputs[0]); nt_.links.new(ps_.outputs["Color"], mul1.inputs[1])
nt_.links.new(mul1.outputs[0], mul2.inputs[0]); nt_.links.new(pt_.outputs["Color"], mul2.inputs[1]); nt_.links.new(map_.outputs[0] if os.environ.get("NO_LINES") else mul2.outputs[0], em_.inputs["Color"]); nt_.links.new(em_.outputs[0], out_.inputs[0])
dup.data.materials.clear(); dup.data.materials.append(bk)
target = bpy.data.images.new("bodyao", BAKE_SIZE, BAKE_SIZE, float_buffer=False, alpha=False); target.colorspace_settings.name = "sRGB"
ti_ = nt_.nodes.new("ShaderNodeTexImage"); ti_.image = target; nt_.nodes.active = ti_; ti_.select = True
sc_ = bpy.context.scene; sc_.render.engine = "CYCLES"; sc_.cycles.samples = 16; sc_.cycles.use_denoising = False; sc_.cycles.bake_type = "EMIT"
sc_.render.bake.use_selected_to_active = False; sc_.render.bake.margin = 8; sc_.render.bake.use_clear = True
for o_ in bpy.data.objects: o_.select_set(False)
dup.select_set(True); bpy.context.view_layer.objects.active = dup
ob.hide_render = True   # the copy must be alone, or every AO ray hits the identical original at t=0 (black map)
log("baking", BAKE_SIZE); bpy.ops.object.bake(type="EMIT"); ob.hide_render = False; target.save(filepath=os.path.join(WORK, "bodyao.png"), quality=95); log("baked")
tmp_ = dup.data; bpy.data.objects.remove(dup); bpy.data.meshes.remove(tmp_)
target.filepath_raw = os.path.join(WORK, "bodyao.png"); target.file_format = "PNG"; target.save()
for n_ in ("paint", "stripe", "carbon"):
    mt_ = MATS[n_]; bs_ = mt_.node_tree.nodes["Principled BSDF"]; tc_ = bs_.inputs["Base Color"].default_value[:]
    mx_ = mt_.node_tree.nodes.new("ShaderNodeMix"); mx_.data_type = "RGBA"; mx_.blend_type = "MULTIPLY"; mx_.inputs[0].default_value = 1.
    tx_ = mt_.node_tree.nodes.new("ShaderNodeTexImage"); tx_.image = target; tx_.interpolation = "Linear"
    mx_.inputs["B"].default_value = tc_; mt_.node_tree.links.new(tx_.outputs["Color"], mx_.inputs["A"]); mt_.node_tree.links.new(mx_.outputs["Result"], bs_.inputs["Base Color"])
log("baked map on paint/stripe/carbon")
