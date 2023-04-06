import usd2gltf
from pxr import Usd, UsdGeom, Gf
from pygltflib import GLTF2
import os
import zipfile
from pathlib import Path
import sys
import tempfile

# Import usd2gltf converter from folder location because it is not exported by __init__.py
# Alternatively add following line to https://github.com/mikelyndon/usd2gltf/blob/main/src/usd2gltf/__init__.py inside the downloaded package
# import usd2gltf.converter as converter
import importlib.util
spec = importlib.util.spec_from_file_location("usd2gltf_converter", os.path.join(os.path.dirname(usd2gltf.__file__), "converter.py"))
usd2gltf_converter = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = usd2gltf_converter
spec.loader.exec_module(usd2gltf_converter)

def unzipUsdz(tmp_dir, input_path):
    # Unzip USDZ if needed
    # ~ thanks to usd2gtlf
    if ".usdz" in input_path:
        with zipfile.ZipFile(input_path, "r") as zip_ref:
            zip_name = os.path.basename(input_path)
            zip_ext = os.path.splitext(zip_name)[0]

            temp_name = os.path.join(tmp_dir.name, zip_ext)

            os.mkdir(temp_name)

            zip_ref.extractall(temp_name)

            for path in Path(temp_name).rglob("*.usd*"):
                path = str(path)
                #logger.debug("Unzipped source file: " + path)
                return path
    else:
        return input_path

def convertModel(input_path, output_dir):
    basenameNoExt = os.path.splitext(os.path.basename(input_path))[0]
    tmp_dir = tempfile.TemporaryDirectory()

    ###########
    ## UNZIP ##
    ###########
    input_path = unzipUsdz(tmp_dir, input_path)

    ############
    ## SHRINK ##
    ############
    stage = Usd.Stage.Open(input_path)
    default_prim = stage.GetDefaultPrim()
    xformCommonAPI = UsdGeom.XformCommonAPI(default_prim)
    xform = UsdGeom.Xformable(default_prim)

    # handle transform opertations
    for op in xform.GetOrderedXformOps():
        if op.GetName() == 'xformOp:transform':        
            (transl, rotate, scale, pivot, rotOrder) = xformCommonAPI.GetXformVectors(Usd.TimeCode.Default())
            xform.ClearXformOpOrder()
            xformCommonAPI.SetXformVectors(transl, rotate, scale, pivot, rotOrder, Usd.TimeCode.Default())

    # shrink model because google ar core show one unit as 1 meter, but fusion 360 shows one unit as 1 millimeter
    xformCommonAPI.SetScale((0.001, 0.001, 0.001))
    stage.Export(input_path)

    #############
    ## CONVERT ##
    #############

    factory = usd2gltf_converter.Converter()
    factory.interpolation = "LINEAR"
    factory.flatten_xform_animation = False

    stage = factory.load_usd(input_path)
    factory.process(stage, os.path.join(output_dir, f"{basenameNoExt}.gltf"))

    tmp_dir.cleanup()

if __name__ == "__main__":
  [progName, input_path, output_dir] = sys.argv
  convertModel(input_path, output_dir)