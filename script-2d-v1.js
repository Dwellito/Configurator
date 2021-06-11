// src= "http://localhost/scripts/scriptsjs/studios-caleb/script-2d.js"
//https://distracted-hugle-94e570.netlify.app/script-2d.js

var show_zero_price = "";
var slidesT = ["size", 'exterior', 'interior', 'layout', "installation", "summary"], $slide = $(".configuration-slide"), zz = "22EP8BJUJKCW2YGUN8RS", hc = "w-condition-invisible", sB = ['upgrades', 'interior', 'services', 'exterior' , 'layout'], sC = [ "price" , "model" , "load"], ccI = ".collection-item", ccW = ".collection-selection-wrapper", ccF = "#model-item-selection", ccFM = "#model-item-selection-multiple", ccM = ".title-section", ccS = ".summary-studio"
var formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits : 0});
var levels = {
    "multiple" : [],
    "simple" : []
}
$(() => {
    $slide.slick({dots: true,infinite: false,arrows: false,speed: 500,fade: true,cssEase: 'linear',swipe: false,swipeToSlide: false});
    $(".btn-slides").scroll(() => { var l = $(this).scrollLeft(); $(".btn-slides").scrollLeft();})
    $("#open-3d-modal").click(() => { $(".modal-pop-up._3d-model").removeClass("no-visible")})
    $("#close-3d-modal").click(() => {$(".modal-pop-up._3d-model").addClass("no-visible") })
})

function init(){
    var sections = { m : [], exterior : [], interior : [], layout : [], upgrades : [], services : [] }
    var currencys = []

    setTimeout(() => { $(".div-block-257").removeClass("hidden") }, 300)
    $(".models").each(function(){
        sections.m.push({type : $(this).data("type"), name : $(this).data("name"), slug : $(this).data("slug"), price : $(this).data("price"), image : $(this).data("image")})
    })

    $('.rendered-sections').each(function(){
        var type = $(this).data("type").toLowerCase()
        var description = $(this).closest(".w-dyn-item").find('.longer-description-html').html()
        var st = $(this).data("subtype")
        var exist_subtype = sections[type].find(function(item){
            return item.subtype == st
        })
        var selection = $(this).data('selection').toLowerCase()
        selection = (selection.includes("simple") ? "simple" : "multiple")
        var active = !exist_subtype && selection == "simple"
        sections[type].push({type : $(this).data("type"), subtype : $(this).data("subtype"), namesubtype : $(this).data("namesubtype"), name : $(this).data("name"), slug : $(this).data("slug"), price : $(this).data("price"),  image : $(this).data("image"), thumbnail : $(this).data("thumbnail"), description, active, show : false, order : $(this).data('order'), selection : selection, object : $(this).data('object'), group : $(this).data('group'), material : $(this).data('material'), function : $(this).data('function'), parent : $(this).data('parent'), childs : [], activeLevel : [] })
    })

    var childHtml = {
        "multiple" : [],
        "simple" : []
    }

    var typeItem = ["simple", "multiple"]
    for(var i in typeItem){
        var type = typeItem[i]
        console.log(type)
        $('.'+type+' [class^="box-level"]').each(function(i){
            var classLevel = $(this).attr("class").split(" ")[0]
            var level = classLevel.replace("box-level-", "")
            levels[type].push(level)
            var htmlParentLevel = $("."+classLevel)[0].outerHTML
            var $htmlParentLevel = $(htmlParentLevel)
            var childLevel = $htmlParentLevel.find(".level-"+level)[0].outerHTML

            $htmlParentLevel.find('*[class^="box-level"]').each(function(){
                $(this).remove()
            })
            $htmlParentLevel.find(".level-"+level).remove()

            var htmlParentLevel = $htmlParentLevel[0].outerHTML //'<div role="list" class="'+parentClass+'"></div>'  

            childHtml[type].push({level : level, html : htmlParentLevel, htmlchild : childLevel })
        })
                
    }

   

    var parentHTML = ""
    if($(ccM).parent().find(ccW).length > 0){
        $(ccM).parent().find(ccW).each(function(){
            if ($(this).find(".items-section").length > 0){
                parentHTML = $(this)[0].outerHTML
            }
        })
    }
    parentHTML = (parentHTML == "") ? wrapperDefault : parentHTML
    var item = ($(ccF).length > 0) ? $(ccF)[0].outerHTML : itemDefault
    $(ccM).parent().find(ccW).remove()
    $(ccF).remove()

    var itemM = ($(ccFM).length > 0) ? $(ccFM)[0].outerHTML : itemDefault
    $(ccFM).remove()

    $(".btn-slides").each(function(i){
        $(this).find(".nav-bar-click-link").each(function(j){
            $(this).attr('x-bind:class', "{'selected' : slideActive == '"+j+"', 'not-selective-link' : slideActive < '"+j+"'}")
        })
    })

    $('.button-wrapper').find('a').attr('x-bind:class', '{"invalid" : !valid}')



    for(var s in sections){
        if(s != "m" && s != 'services'){
            var section = sections[s]
            var subtypes = [];
            var j = 0
            section.map(function(it){
                it.childs = section.filter(st => st.parent === it.slug)
            })
            section.map(function(tag){
                if(!subtypes.find(st => st.value === tag.subtype)){
                    var items = section.filter(st => st.subtype === tag.subtype && st.parent == "")
                    subtypes.push({value : tag.subtype, title : tag.namesubtype, items })
                }
            })
    
            subtypes.map(function(st){

                var $parentHTML = $(parentHTML)
                $parentHTML.find('.title-subsection').text(st.title)

                var parentClass = $parentHTML.find('.items-section').attr("class")
                var htmlItems = '<div role="list" class="'+parentClass+'">'  
                st.items.map(function(it){

                    var $item = (it.selection == "simple") ? $(item) : $(itemM)
                    $item.removeAttr("id")
                    $item.find('.parent').attr("id", it.slug)
                    $item.find('.parent').attr("data-type", it.type)
                    var vectary_function = it.function.toLowerCase().replace(" ", "-")
                    $item.find('.parent').attr("data-object", it.object).attr("data-group", it.group).attr("data-material", it.material).attr("data-function", it.function).addClass(vectary_function)
                    $item.find('img.image').attr('src', it.thumbnail).attr('srcset', it.thumbnail)
                    $item.find('.text-block').text(it.name)
                    $item.find('.long_description').html(it.description)
                    $item.find('.btn-details').attr('x-on:click', `showPop('${s}', ${j})`)
                    $item.find('.details').attr('x-bind:class' , '{"show" : studio.'+s+'.selected['+j+'].show}').attr('x-on:click', `hidePop('${s}', ${j})`) 
                    j++
                    var $p = $item.find('.text-price')

                    var h_price = $p.html()
                    if(h_price){
                        h_price = h_price.replace("{price}", it.price)
                        $p.html(h_price)
                        $item.find('.text-price span').attr("x-text", "setCurrencyPrice("+it.price+", '+ $')")
                    }

                    if(it.price === 0)
                        $p.addClass(hc)
                    if(it.description == ""){
                        $item.find('.btn-details').css({'display' : 'none'})
                    }
                    
                    if(it.active){
                        $item.addClass("selected")
                    }
                    $item.find('.parent').attr("data-selection", it.selection)
                    $item.find(".w-embed span").attr("data-name", it.name).attr("data-type", it.type)

                    for(var m = 0; m < childHtml[it.selection].length; m++){
                        var el = childHtml[it.selection][m]
                        // console.log(el.htmlchild)
                        var classList = $(el.html).find(".list").attr("class")
                        $(el.html).find(".list").remove()
                        var $itemChild = $(el.htmlchild)
                        $itemChild.find('.image').attr('x-bind:src', "option.thumbnail").attr("x-bind:srcset", "option.thumbnail")
                        $itemChild.attr("x-bind:id", "option.slug")
                        $itemChild.attr("x-bind:data-type", "option.type")
                        $itemChild.attr("x-bind:data-level", "'"+el.level+"'")
                        $itemChild.attr("x-bind:class", "{'selected' : option.active}")
                        var childTemplate = `<template x-if="getShowLevel('${it.slug}', '${el.level}', '${it.type}') == true">
                        <div class="${classList}"><template role="listitem" x-for="option in activeLevel['${it.subtype}'][${m}].items" :key="option">
                        ${$itemChild[0].outerHTML}
                        </template></div></template>`
                        //x-data="getDataChilds('${it.slug}', '${it.type}')
                        //activeLevel[${m}].items
                        //getDataChilds('${it.slug}', '${el.level}', '${it.type}')
                        $item.find(".box-level-"+el.level +" .list").html(childTemplate)
                        $item.find(".box-level-"+el.level).attr("x-if",)
                    }

                    htmlItems += $item[0].outerHTML
                })
                htmlItems += '</div>'


                $parentHTML.find(".w-dyn-list").html(htmlItems)
                $('.'+s+' '+ccM).parent().append($parentHTML)
            })

            // console.log(subtypes)
        }  
    }

//    console.log(sections)
//    console.log(childHtml)

    $("input:required").attr("x-on:input", "validate()")
    $('form').attr("x-on:keydown.enter.prevent", "")
    $('#next-button').attr("href", "javascript:void(0)")
    $('form').attr("x-on:submit", "submit(event)")
    $(".currency-link").each(function(){
        var dataC = $(this).parent().find('.currency').data()
        $(this).attr("x-on:click", `changeCurrency('${dataC.currency}')`)
        currencys[dataC.currency] = dataC.value
    })

    $(".p-currency").each(function(){
        var text = $(this).text()
        $(this).attr('x-text', `setCurrencyPrice('${text}')`)
    })

    var imgshipping = $("#shipping-img").attr("src")
    var iSlide = 0
    $(".div-block-257 a").each(function(){
        var j = $(this).parent().find("a").length
        if(iSlide == j) iSlide = 0
        $(this).attr("x-on:click", "goSlide("+iSlide+")")
        iSlide++
    })

    var classitemOrder = ($(ccS).length > 0) ? $(ccS).children(':first-child').attr("class") : 'summary-studio w-dyn-items'
    var itemOrder = ($(ccS).children().length > 0) ? $(ccS).children(':first-child')[0].outerHTML : $(itemSummaryDefault)[0].outerHTML
    var $itemOrder = $(itemOrder)
    var templateCustomOrder = ''
    templateCustomOrder += '<template role="listitem" class="'+classitemOrder+'" x-for="item in studioItems" :key="item">'
    $itemOrder.find('.div-block-295').attr('x-bind:class', `{'hidden' : item.type == 'model'}`)
    $itemOrder.find('img').attr('x-show', "item.thumbnail").attr('x-bind:src', "item.thumbnail").attr("x-bind:srcset", "item.thumbnail")
    $itemOrder.find('.price-text').attr("x-text", "formatMoney(setCurrencyPrice(item.price), false)").removeClass(hc)
    $itemOrder.find('.title-tag').attr("x-text","item.name")
    $itemOrder.find('.div-block-295').append(summaryHTML)
    templateCustomOrder += $itemOrder.html() + "</template>"

    $(".custom-items").html(templateCustomOrder)

    let model = window.location.pathname
    model = model.split("/").pop()

    var modelSelected = sections.m.find(function(m){  return m.slug == model })
    var studio = {
        model : modelSelected,
        price :  formatter.format(modelSelected.price),
        load : 0
    }
    for(sec in sections){
        if(sec != 'm'){
        studio[sec] = {
            active: (sections[sec].length > 0) ? sections[sec][0] : {image : null, price: 0},
            selected: sections[sec]
        }}
    }
    return {
        sections : sections, studio : studio, studioItems : [], active : true,  shipping : 0, customer : customer, upgradesV : "", servicesV : "", interiorV : "", layoutV : "", exteriorV : "", valid : true, currency : "USD", slideActive : 0, summarySlide : slidesT.length - 1, installationSlide : slidesT.length - 2, show_furniture : true,
        await : true,
        activeLevel : [],
        activeOptionLevel : {
            slug : "",
            levels : [],
        },
        init : function(){
            history.pushState(null, "", "#size");
            this.renderSelection()
            this.studio.price = formatter.format(this.setCurrencyPrice(modelSelected.price))
            this.setPrice()
            var _this = this

            $slide.on('beforeChange', function(e, s, c, nS){
                var uri = window.location.href
                uri = uri.split("#")[0]
                _this.slideActive = nS
                history.pushState({}, null, uri + "#"+ slidesT[nS]);
        
            });
            for(var section in sections){
                if(section != "m"){
                    var subtypes = []
                    var type = ""
                    for(i in sections[section]){
                        var item = sections[section][i]
                        type = item.selection
                        if(!subtypes.includes(item.subtype)){
                            subtypes.push(item.subtype)
                        }
                    }
                    for(i in subtypes){
                        this.activeLevel[subtypes[i]] = []
                        for(var l in levels[type]){
                            this.activeLevel[subtypes[i]].push({level : l, items : []})
                        }
                    }
                }
            }
        },
        setStudio : function(event){
            var target = event.target
            var $target = $(target).closest(".parent")
            var $child = null

            if($target.length == 0){
                $child = $(event.target).closest(".collection-item")
            }

            if($target.length > 0 && !$(event.target).hasClass("text-details")){
                var slug = $target.attr("id")
                var type = $target.data("type").toLowerCase()
                var tag = sections[type]
                var item = tag.find(function(i){ return i.slug == slug })

                $target.find(".section-3d").addClass("active")

                if(item.selection == "multiple"){
                    if(item.active && this.activeOptionLevel.slug == item.slug || !item.active || item.childs.length == 0){
                        $target.toggleClass("selected")
                        this.studio[type].selected.map(function(i){
                            if(i.slug == slug) i.active = !i.active
                            return i
                        })
                    }
                    if(item.childs.length > 0 && !item.active){
                        item.childs.map(function(c){
                            return c.active = false
                        })
                    }

                }else if(item.selection == "simple"){
                    $target.closest(".collection-list").find(".collection-item").removeClass("selected")
                    $target.parent().addClass("selected")
                    var subtype = item.subtype
                    this.studio[type].selected.map(function(i){
                        if(i.subtype == subtype) i.active = false
                        if(i.slug == slug) i.active = !i.active

                        return i
                    })
                }
                
                for(var l = 0; l < levels[item.selection ].length; l++){
                    this.activeLevel[item.subtype][l].items = []
                }

                this.activeLevel[item.subtype][0].items = item.childs

                this.activeOptionLevel = {
                    slug : "",
                    levels : []
                }

                if(item.childs.length > 0 && item.active){
                    this.activeOptionLevel = {
                        slug : item.slug,
                        levels : [levels[item.selection ][0]]
                    }
                }

                this.studio[type].active = item
                this.setPrice()
                this.renderSelection()

            }else if($child.length > 0){
                var slug = $child.attr("id")
                var type = $child.data("type").toLowerCase()
                var level = $child.data("level").toLowerCase()
                var tag = sections[type]
                var item = tag.find(function(i){ return i.slug == slug })

                if(item.selection == "multiple"){
                    $child.toggleClass("selected")
                }else if(item.selection == "simple"){
                    $child.parent().find(".collection-item").removeClass("selected")
                    $child.addClass("selected")
                }

                var subtype = item.subtype
                var _this = this
                this.studio[type].selected.map(function(i){
                    if(i.slug == slug) {
                        i.active = !i.active

                        var parent = i.parent
                        if(parent != "")
                            _this.setParent(parent, type)
                    }
                    return i
                })

                var l_index = levels[item.selection ].findIndex(function(l){
                    return l == level
                })

                l_index++
                var next_level = levels[item.selection ][l_index]
                this.activeOptionLevel.levels.splice(l_index);
                
                for(var l = l_index; l < levels[item.selection ].length; l++){
                    this.activeLevel[item.subtype][l].items = []
                    
                }

                if(item.childs.length > 0){
                    this.activeLevel[item.subtype][l_index].items = item.childs
                    this.activeOptionLevel.levels.push(next_level)
                }

                setTimeout(function(){
                    _this.renderSelection()
                    _this.setPrice()
                    // console.log({..._this.studio})
                }, 200)
                

            }
        },
        setParent(p, type){
            var _this = this
            this.studio[type].selected.map(function(j){
                if(j.slug == p) {
                    j.active = true

                    var parent = j.parent
                    if(parent != "")
                        _this.setParent(parent, type)
                }
                return j
            })
        },
        // getDataChilds(slug, level, type){
        //     type = type.toLowerCase()
        //     var item = sections[type].find(function(i){ return i.slug == slug })

        //     var l_index = levels.findIndex(function(l){
        //         return l == level
        //     })
        //     return item.activeLevel[l_index].items
        // },
        getShowLevel(slug, level, type){
            type = type.toLowerCase()
            var item = this.studio[type].selected.find(function(i){
                return i.slug == slug
            })

            var show = (this.activeOptionLevel.slug == slug && this.activeOptionLevel.levels.includes(level)) || (item.active && item.selection == "simple")

            return show
        },
        setPrice : function(){
            var total = modelSelected.price
            for (const i in this.studio) {
                var item = this.studio[i]
                if(i != "model"){
                    if(item.price != undefined){
                        total = parseFloat(total) + parseFloat(item.price) 
                    }else{
                        for (const j in this.studio[i].selected) {
                            var itemJ = this.studio[i].selected[j]
                            if(itemJ.active)
                                total = parseFloat(total) + parseFloat(itemJ.price) 
                        }
                    }
                }
            }
            total = parseFloat(total) + parseFloat(this.shipping)
            this.studio.price = formatter.format(this.setCurrencyPrice(total))
            this.setLoan(total)
        },
        setLoan : function(total){
            var tax = (parseFloat(8) + parseFloat(2.9) + parseFloat(2)) / 100;
            var interest_rate = 6.89 / 100
            var total_porcentage = Math.pow(1+(interest_rate/12), -60) 
            total_porcentage = (total * (interest_rate/12))/(1-(total_porcentage))
            total_porcentage = parseFloat(total_porcentage) + parseFloat((total*tax) / 60)
            total_porcentage = this.setCurrencyPrice(total_porcentage)
            this.studio.load = formatter.format(total_porcentage)+"/mo"
        },
        goSlide : function(slide) {
            if(slide == 'next'){ slide = (this.valid) ? parseInt(this.slideActive) + 1 : this.slideActive }
            this.valid = true
            var inputs = $("input:required").filter(function(i, elem){
                return $(elem).val() == ""
            })        
            if(slide == this.summarySlide){ 
                if(inputs.length > 0){ this.valid = false }
                else{ this.valid = true }
            }
            if(this.valid){ $("#slick-slide-control0"+slide).click() }
            if(slide == this.installationSlide  && inputs.length > 0) this.valid = false
        },
        renderSelection(){
            this.studioItems = []
            var b = sB
            var c = sC
            for (const i in this.studio) {
                var item = this.studio[i]
                var value = []
                if( !c.includes(i) && item != undefined){
                    if(b.includes(i) ){
                        var items = item.selected.filter(function(iJ){ return iJ.active})
                        for (const j in items) {
                            value.push(items[j].name)
                            let renderitem = { type: items[j].type, name : items[j].name, slug : items[j].slug, price : items[j].price, image : (items[j].image) ? items[j].image : null, thumbnail : (items[j].thumbnail) ? items[j].thumbnail : null}
                            this.studioItems.push(renderitem)
                        }
                        this[i+"V"] = value.join(", ")
                    }
                } 
            } 
            this.studioItems.push({type : "shipping", name : "Estimated shipping", price : this.shipping,  image : "", thumbnail : imgshipping})  
            this.studioItems.push(modelSelected)  
        },
        formatMoney : function(price, show = true){
            if(show) return formatter.format(price)
            else return (price == 0) ? show_zero_price : formatter.format(price)
        }, 
        changeZip : function(event){
            var zip_init = $("#zip-init").text();
            var zip_price = $("#zip-price").text();            
            var zip = event.target.value
            var _this = this
            if(zip != ""){
                $.get("https://api.zip-codes.com/ZipCodesAPI.svc/1.0/CalculateDistance/ByZip?fromzipcode="+zip_init+"&tozipcode="+zip+"&key="+zz)
                .done(function(res){
                    if(res.DistanceInMiles || res.DistanceInMiles == 0.0){
                        _this.shipping = parseFloat(res.DistanceInMiles) * parseFloat(zip_price)
                        _this.setPrice()
                        _this.renderSelection()
                    }else{
                        _this.shipping = 0
                        _this.renderSelection()
                    }
                })    
            }else{
                _this.shipping = 0
                _this.renderSelection()
            }
        },
        validate : function(){
            var inputs = $("input:required").filter(function(i, elem){ return $(elem).val() == "" })
            if(inputs.length == 0) this.valid = true
            else this.valid = false
        }, 
        validateForm : function(){
            var slideActive = $(".w-slider-dot.w-active")
            var i = slideActive.index()
            i = parseInt(i) + parseInt(1)
            if(i != installationSlide){ this.goSlide(i) }
            else{
                var inputs = $("input:required").filter(function(i, elem){ return $(elem).val() == "" })
                if(inputs.length == 0){ this.goSlide(i)}
            }
        },
        submit : function(event){
            var data = $('form').serialize()
            data = window.btoa(data)
            var sTags = JSON.stringify(this.studioItems)
            var t = window.btoa(sTags)
            $( document ).ajaxComplete(function() { window.location.href = "/thank-you?s="+data+"&t="+t });
            return false
        },
        changeCurrency : function(c){
            this.currency = c
            this.setPrice()
            $(document).find('.w-dropdown').each(function (i, el) {
                $(el).triggerHandler('w-close.w-dropdown');
            });
        },
        setCurrencyPrice: function(p, symbol = ""){ return symbol + " " + (p / currencys[this.currency]).toFixed(0) },
        showPop: function(s, i){ this.studio[s].selected[i].show = true },
        hidePop: function(s, i){ this.studio[s].selected[i].show = false },
        showFurniture : function(){
            var _this = this
            if(this.await){
                this.await = false
                setTimeout(function(){
                    _this.show_furniture = !_this.show_furniture
                    _this.await = true
                }, 120)
            }


        }
     }
}
