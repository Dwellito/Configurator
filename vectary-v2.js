import { VctrApi } from "https://www.vectary.com/viewer-api/v1/api.js";
var switchingInProgress = false;

$(".material-change").click(async function(){
    var material = $(this).data("material")
    var group = $(this).data("group")
    var color = null

    if(material){
      material = material.split("|")
      color = (material.length > 1) ? material[1] : color
      material = material[0]
    }
    
    var objects = $(this).data("object")
    if(objects){
      objects = objects.split(",")
    }
    
    if(group != ""){
        const objectG = await vA.getObjectByName(group);
        objects = objectG.childrenNames
    }

    for(var i in objects){
      var object = objects[i]
      const changeMaterialSuccess = await vA.setMaterial(object, material);

      if(color)
        var colorChangeResultt = await vA.updateMaterial(material, { color: color });
    }

})

$(".object-visibility").click(async function(){
  var visibility = $(this).hasClass("selected")
  
  var objects = $(this).data("object")
  var group = $(this).data("group")
  
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
      const changeVisibilitySuccess = await vA.setVisibility(
        [object],
        visibility,
        false);
    }

    for(var i in secundary){
      var object = secundary[i]
      const changeVisibilitySuccess = await vA.setVisibility(
        [object],
        false,
        false);
    }
  }
})

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

async function run() {
    function errHandler(err) {
        //console.log("API error", err);
    }

    async function onReady() {        
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

run();
