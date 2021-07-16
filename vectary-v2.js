//https://quoscripts.sfo2.digitaloceanspaces.com/studio-configurator/vectary-v2.min.js

import { VctrApi } from "https://www.vectary.com/viewer-api/v1/api.js";
var switchingInProgress = false;

$(".wrapper-selections-40").on("click", ".material-change---object-visibility", async function(){
  var _this = this
  setTimeout(function(){
    setVisibility(_this)
  }, 120)
  
  setMaterial(this)
})

$(".wrapper-selections-40").on("click",".material-change", function(){
  setMaterial(this)
})

async function setMaterial(el){
  var material = $(el).data("material")
    var group = $(el).data("group")
    var color = null

    if(material){
      material = material.split("|")
      color = (material.length > 1) ? material[1] : color
      material = material[0]
    }
    
    var objects = $(el).data("object")
    if(objects){
      objects = objects.split("|")
      objects = objects[0]
      objects = objects.split(",")
    }
    
    if(group != ""){
        const objectG = await vA.getObjectByName(group);
        objects = objectG.childrenNames
    }
    console.log(objects)
    for(var i in objects){
      var object = objects[i]
      console.log(object, material)
      const changeMaterialSuccess = await vA.setMaterial(object, material);
      console.log(changeMaterialSuccess)

      if(color){
        var colorChangeResultt = await vA.updateMaterial(material, { color: color });
        console.log(colorChangeResultt)
      }
    }
}
$(".wrapper-selections-40").on("click",".object-visibility", function(){
  setVisibility(this)
})
async function setVisibility(el){
  console.log($(el))
  if($(el).parent().hasClass("list"))
    var visibility = $(el).hasClass("selected")
  else
    var visibility = $(el).parent().hasClass("selected")
  
    console.log(visibility)

  var objects = $(el).data("object")
  var group = $(el).data("group")
  
  if(group != ""){
    var groups = group.split("|")
    const objectG = await vA.getObjectByName(groups[0]);
    objects = objectG.childrenNames.join(",")

    if(groups.length > 1){
      var objectGS = await vA.getObjectByName(groups[1]);
      objects = objects + "|" + objectGS.childrenNames.join(",")
    }
  }

  if(objects){
    objects = objects.split("|")
    var primary = objects[0].split(",")
    var secundary = (objects.length > 1) ? objects[1].split(",") : [] 

    for(var i in primary){
      var object = primary[i]
      console.log("Primary: ", object, visibility)
      const changeVisibilitySuccess = await vA.setVisibility(
        [object],
        visibility,
        false);
    }

    for(var i in secundary){
      var object = secundary[i]
      console.log("Secundary: ", object, visibility)
      const changeVisibilitySuccess = await vA.setVisibility(
        [object],
        false,
        false);
    }
  }
}

$(".full-width-button, .btn-slides a").click(async function(){
	var uri = window.location.href
  uri = uri.split("#")[1]
  
  if(views[uri]){
    var view = String(views[uri])
    var fov = null
    if(view != "") {
      view = view.split("|")
      fov = (view.length > 1) ? view[1] : null
      view = view[0]
    }
    if (!switchingInProgress) {
      switchingInProgress = true;
     
      if(fov)
      await vA.setFOV(fov);

      await vA.switchViewAsync(view);
      switchingInProgress = false;
    }
  }
})

function addOptionsToSelector(names, htmlSelectElem) {
  names.forEach((name) => {
      const newOption = document.createElement("option");
      newOption.value = name;
      newOption.innerText = name;

      htmlSelectElem.appendChild(newOption);
  });
}

const materialSelector = document.getElementById("select_material");
const meshSelector = document.getElementById("select_mesh");

async function changeV(){
  var object = $("#select_mesh").val();
  console.log(object)
  const isVisible = vA.getVisibility(object);
  console.log(isVisible)
  const changeVisibilitySuccess = await vA.setVisibility(
    object,
    true,
    true);
}

async function changeM(){
  var object = $("#select_mesh").val();
  var material = $("#select_material").val();
  console.log(object, material)
  const changeMaterialSuccess = await vA.setMaterial(object, material);
  console.log(changeMaterialSuccess)
}

$("#select_mesh").change(function(){
  changeV()
})

$("#select_material").change(function(){
  changeM()
})

async function run() {
    function errHandler(err) {
        //console.log("API error", err);
    }

    async function onReady() {  
      console.log(await vA.getObjects());
      
      const allSceneCameras=await vA.getCameras();
      console.log("Cameras",allSceneCameras);
      const allSceneMaterials=await vA.getMaterials();
      console.log("Materials",allSceneMaterials);

      const allMeshes = await vA.getMeshes();
      
      addOptionsToSelector(allSceneMaterials.map(mat => mat.name), materialSelector);
      addOptionsToSelector(allMeshes.map(mesh => mesh.name), meshSelector);

        var objects_hidden = []
        const objectG = await vA.getObjectByName("Hide");
        objects_hidden = objectG.childrenNames

        for (var i in objects_hidden){
					var o = objects_hidden[i]
          const changeVisibilitySuccess = await vA.setVisibility([o],false,false);
        }

        for (var i in _sections){
          var section = _sections[i]
          for (var j in section){
            var item = section[j]

            if((item.object && item.object != "") || (item.group && item.group != "")){
              var vectary_function = (item.function) ? item.function.toLowerCase().replace(" ", "-") : ""
              var objects = item.object.split("|")
              var group = item.group
  
              if(group != ""){
                var groups = group.split("|")
                const objectG = await vA.getObjectByName(groups[0]);
                objects = objectG.childrenNames.join(",")
            
                if(groups.length > 1){
                  var objectGS = await vA.getObjectByName(groups[1]);
                  objects = objects + "|" + objectGS.childrenNames.join(",")
                }
                objects = objects.split("|")
              }

              if(item.active == false && vectary_function === "object-visibility"){
                  var primary = objects[0].split(",")
              
                  for (var k in primary){
                    var o = primary[k]
                    const changeVisibilitySuccess = await vA.setVisibility([o],false,false);
                  }
              }

              if(item.active == true && vectary_function === "material-change"){
                var material = (item.material && item.material != "") ? item.material.split("|") : []
                var color = (material.length > 1) ? material[1] : null
                material = (material.length > 0) ? material[0] : ""
                objects = objects[0].split(",")

                for(var i in objects){
                  var object = objects[i]
                  const changeMaterialSuccess = await vA.setMaterial(object, material);
                  if(color)
                    var colorChangeResult = await vA.updateMaterial(material, { color: color });
                }
            }

            }


          }
            
        }
    }

    vA = new VctrApi("test", errHandler);
    try {
        await vA.init();
    } catch (e) {
        errHandler(e);
    }

    onReady();
}

$("#open-3d-modal").click(() => {
  setTimeout(function(){
    run();
  }, 300)
  
})

