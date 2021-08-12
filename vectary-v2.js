//https://quoscripts.sfo2.digitaloceanspaces.com/studio-configurator/vectary-v2.min.js

import { VctrApi } from "https://www.vectary.com/viewer-api/v1/api.js";
var switchingInProgress = false;

$(".wrapper-selections-40").on("click", ".material-change---object-visibility", async function(){
  var _this = this
  setTimeout(function(){
    //setVisibility(_this)
    setStudio()
  }, 120)
  
  //setMaterial(this)
})

$(".wrapper-selections-40").on("click",".material-change", function(){
  // setMaterial(this)

  setTimeout(function(){
    setStudio()
  }, 120)
})

async function getObjects(g, objects = []){
    if(g.type == "mesh"){
      objects.push(g)
      return objects
    }else{
      for(var i in g.childrenNames){
        var nG = g.childrenNames[i]
        const objectG = await vA.getObjectByName(nG);
        objects = await getObjects(objectG, objects)
      }
      return objects
    }
}

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
        group = group.split(",")
        objects = []
        for(var i in group){
          var g = group[i]
          // console.log(g)
          const objectG = await vA.getObjectByName(g);
          // console.log(objectG)
          if(objectG)
            objects = objects.concat(objectG.childrenNames)
        }

    }
// console.log(objects)
    for(var i in objects){
      var object = objects[i]
      const changeMaterialSuccess = await vA.setMaterial(object, material);
      // console.log(object, changeMaterialSuccess)
      if(color){
        var colorChangeResultt = await vA.updateMaterial(material, { color: color });
        // console.log(colorChangeResultt)
      }
    }
}
$(".wrapper-selections-40").on("click",".object-visibility", function(){
  var _this = this
  setTimeout(function(){
    //setVisibility(_this)
    setStudio()
  }, 120)
})
async function setVisibility(el){
  console.log($(el))
  if($(el).parent().hasClass("list") || $(el).parent().hasClass("multiple"))
    var visibility = $(el).hasClass("selected")
  else
    var visibility = $(el).parent().hasClass("selected")
  
  var objects = $(el).data("object")
  var group = $(el).data("group")
  
  if(group != ""){
    objects = group
  }

  if(objects){
    objects = objects.split("|")
    var primary = objects[0].split(",")
    var secundary = (objects.length > 1) ? objects[1].split(",") : [] 

      for(var i in primary){
        var object = primary[i]
        if(object.includes("-invert")){
          object = object.replace("-invert", "")
          visibility = !visibility
        }
        var changeVisibilitySuccess = await vA.setVisibility(object, visibility, false);
        console.log(object, visibility, changeVisibilitySuccess)
      }
      
      if(secundary.length > 0){
        console.log("Secundary: ", secundary)
        changeVisibilitySuccess = await vA.setVisibility(secundary, false, false);
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
  const isVisible = await vA.getVisibility(object);
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

$("#select_mesh").change(async function(){
  changeV()
  var o = $("#select_mesh").val()
  const objectG = await vA.getObjectByName(o);
  var objects = await getObjects(objectG)
  console.log(objects)
})

$("#select_material").change(function(){
  changeM()
})

async function setStudio(){
  console.log(_studio)
  var itemsRepeat = []
  var sec = ["exterior", "interior", "layout"]
        for (var i in _studio){
          if( sec.includes(i)){
            var section = _studio[i].selected

            for (var j in section){
              var item = section[j]
             // console.log(item)
              if((item.object && item.object != "") || (item.group && item.group != "")){
                var vectary_function = (item.function) ? item.function.toLowerCase().replace(/ /g, "-") : ""
                var objectsP = item.object.split("|")
                var objectsS = (objectsP.length > 1) ? objectsP[1].split(",") : []
                objectsP = objectsP[0].split(",")
                
                var objectsVP = objectsP
                var objectsVS = objectsS
                var group = item.group
     //console.log(group, vectary_function, {...item})
                if(group != ""){
                  var groups = group.split("|")
                  var primaryGroup = groups[0].split(",")
                  objectsVP = primaryGroup
                  
                  for(var i in primaryGroup){
                    var g = primaryGroup[i]
                    const objectG = await vA.getObjectByName(g);
                    if(objectG){
                      var objectsG = await getObjects(objectG)
                      objectsP = objectsP.concat(objectsG)
                    }

                    // var o = [g]
                    // objectsP = (objectG && objectG.type == "group") ? objectsP.concat(objectG.childrenNames) : objectsP.concat(o)
                    // // console.log(o, objectG, objectsP)
                  }

              
                   if(groups.length > 1){
                     var secundaryGroup = groups[1].split(",")
                     objectsVS = secundaryGroup
                  //   for(var i in secundaryGroup){
                  //     var g = secundaryGroup[i]
                  //     const objectGS = await vA.getObjectByName(g);
                  //     if(objectGS)
                  //       objectsS = objectsS.concat(objectGS.childrenNames)
                  //   }
                   }
                }

                if(vectary_function === "object-visibility" || vectary_function === "material-change---object-visibility"){
                  var visibility = item.active
                  for(var h in objectsVP){
                    var o = objectsVP[h]
                    if(itemsRepeat.includes(o)){
                      visibility = true
                    }
                    if(o.includes("-invert")){
                      o = o.replace("-invert", "")
                      visibility = !visibility
                    }
                    const changeVisibilitySuccess = await vA.setVisibility(o,visibility,false);
                    if(item.active)
                      itemsRepeat.push(objectsVP[h])
                    //console.log(objectsVP[h], o, changeVisibilitySuccess, visibility, item.active)
                  }

                  for(var h in objectsVS){
                    visibility = false
                    var o = objectsVS[h]
                    if(o.includes("-invert")){
                      o = o.replace("-invert", "")
                      visibility = !visibility
                    }
                    const changeVisibilitySuccess = await vA.setVisibility(o,visibility,false);
                    //console.log(o, changeVisibilitySuccess, visibility)
                  }
                  
                }
                if(item.active == true && (vectary_function === "material-change" || vectary_function === "material-change---object-visibility")){
                  var material = (item.material && item.material != "") ? item.material.split("|") : []
                  var color = (material.length > 1) ? material[1] : null
                  material = (material.length > 0) ? material[0] : ""
                  if(material != ""){
                    for(var i in objectsP){
                      var object = objectsP[i]
                      const changeMaterialSuccess = await vA.setMaterial(object, material);
                      // console.log(object, material, color, changeMaterialSuccess)
                      if(color)
                        var colorChangeResult = await vA.updateMaterial(material, { color: color });
                    }
                  }
                }

              }


            }
          }
        }
}

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

      const allMeshes = await vA.getObjects();
      
      addOptionsToSelector(allSceneMaterials.map(mat => mat.name), materialSelector);
      addOptionsToSelector(allMeshes.map(mesh => mesh.name), meshSelector);

        var objects_hidden = []
        const objectG = await vA.getObjectByName("Hide");
        if(objectG)
          objects_hidden = objectG.childrenNames

        for (var i in objects_hidden){
					var o = objects_hidden[i]
          const changeVisibilitySuccess = await vA.setVisibility([o],false,false);
        }

        setStudio()
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

