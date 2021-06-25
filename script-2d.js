var show_zero_price = "";
var slidesT = ["size", 'exterior', 'interior', 'layout', "installation", "summary"], $slide = $(".configuration-slide"), zz = "22EP8BJUJKCW2YGUN8RS", hc = "w-condition-invisible", sB = ['upgrades', 'interior', 'services', 'exterior' , 'layout'], sC = [ "price" , "model" , "load"], ccI = ".collection-item", ccW = ".collection-selection-wrapper", ccF = "#model-item-selection", ccFM = "#model-item-selection-multiple", ccM = ".title-section", ccS = ".summary-studio"
var formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits : 2});
const lookup = {
    "the-twelve": {"price-per-mile": 3.50},
    "the-sixteen": {"price-per-mile": 4.00}
}

var levels = {
    "multiple" : [],
    "simple" : []
}

const backendUrl = document.location.host === "www.configure.so" ? "https://dwellito.co" : "https://test.dwellito.co"
const stripeKey = document.location.host === "www.configure.so" ? 'pk_live_51IbUhkHy8pZ91dsyEHbItdV3dRUHfxAhBaBYaYQvVrofC3IoygYQcjbEaMUcDhaaWYOvCU30o3zm0hS5mVLZZBQi00nfYUtQmb' : 'pk_test_51IbUhkHy8pZ91dsyNfbUFA1ynj6Sb0NmifdoQm4ISo83X4cOFpA68UH0DbLrgzsaQxlV3lJrGr394Cj3GMCUHTcA006LK2wa7Y'

const getModelName = thePath => thePath.substring(thePath.lastIndexOf('/') + 1)

function isTakeRateModel () {
    const model = getModelName(window.location.pathname)
    return model !== "holo" && model !== "holo-extended-4ft" && model !== "holo-extended-8ft"
}

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;
    // Fire the loading
    head.appendChild(script);
}

var shippingCost = null;
var totalPrice = null;
var stripePaymentIntentSecret = null;
var stripePaymentIntentID = null;
var stripeCard = null;
var stripeObj = null;

const redirectToStripe = function() {};

function validEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


function parseMiles (str) {
    var regex = new RegExp('mi|,', 'igm')
    var txt = str.replace(regex, '').trim()
    return parseInt(txt)
}

function createOrUpdatePaymentIntent () {
    const emailElement = document.getElementById("Email");
    const email = emailElement.value;
    const amount = shippingCost ? totalPrice - shippingCost : totalPrice;
    const depositAmount = Math.floor(amount * 0.015)

    document.getElementById("deposit-price").innerHTML = formatter.format(depositAmount)
    document.getElementById("checkout-button-price").disabled = true;
    document.getElementById("checkout-button-price").setAttribute("style", "background: gray")

    var response = fetch(backendUrl + '/api/stripe/secret', {
        method : "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        mode: "cors",
        redirect: "error",
        body: JSON.stringify({
            amount: depositAmount * 100,
            email: email,
            model: getModelName(window.location.pathname),
            id: stripePaymentIntentID
        })
    }).then(function(response) {
        return response.json();
    }).then(function(responseJson) {
        document.getElementById("stripe-embed").setAttribute("style", "width: inherit; margin: 32px 8px")

        stripePaymentIntentSecret = responseJson.secret;
        stripePaymentIntentID = responseJson.id;

        stripeObj = Stripe(stripeKey);
        var elements = stripeObj.elements();
        var style = {
            base: {
                color: "#32325d",
            }
        };

        stripeCard = elements.create("card", { style: style });
        stripeCard.mount("#card-element");

        stripeCard.on('change', ({error}) => {
            let displayError = document.getElementById('card-errors');
            if (error) {
                displayError.setAttribute("style", "margin: 8px")
                displayError.textContent = error.message;
                document.getElementById("checkout-button-price").disabled = true;
                document.getElementById("checkout-button-price").setAttribute("style", "background: gray")
            } else {
                displayError.removeAttribute("style")
                displayError.textContent = '';
                document.getElementById("checkout-button-price").disabled = false;
                document.getElementById("checkout-button-price").removeAttribute("style")
            }
        });
    });
}

function stripeMakePayment (card, secret) {

    var address = document.getElementById('Address').value.trim();
    var city = document.getElementById('City').value.trim();
    var state = document.getElementById('State').value.trim();
    var zip = document.getElementById('Zip-Code').value.trim();
    var name = document.getElementById('Name').value.trim();
    var email = document.getElementById('Email').value.trim();
    var phone = document.getElementById('Phone-Number').value.trim();

    stripeObj.confirmCardPayment(secret, {
        payment_method: {
            card: card,
            billing_details: {
                address: {
                    line1: address,
                    city: city,
                    state: state,
                    postal_code: zip
                },
                name: name,
                email: email,
                phone: phone
            }
        }
    }).then(function(result) {
        if (result.error) {
            // Show error to your customer (e.g., insufficient funds)
            console.log(result.error.message);

            gtag("event", "purchase_failed", {
                model_name: getModelName(window.location.pathname)
            })
            window.location.href = "https://" + window.location.hostname + "/payment-failure";
        } else {
            // The payment has been processed!
            if (result.paymentIntent.status === 'succeeded') {
                // Show a success message to your customer
                // There's a risk of the customer closing the window before callback
                // execution. Set up a webhook or plugin to listen for the
                // payment_intent.succeeded event that handles any business critical
                // post-payment actions.
                gtag("event", "purchase", {
                    currency: "USD",
                    value: shippingCost ? totalPrice - shippingCost : totalPrice,
                    shipping: shippingCost || 0,
                    items: [
                        {item_name: getModelName(window.location.pathname)}
                    ]
                })
                console.log("SUCCESS")
                window.location.href = "https://" + window.location.hostname + "/thank-you"
            }
        }
    });
}

$(() => {
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyDnH-26A_sEu0vzOa94U5Tfgukhf89ARCE&libraries=&v=weekly", redirectToStripe)
    loadScript("https://js.stripe.com/v3", redirectToStripe)
    $slide.slick({dots: true,infinite: false,arrows: false,speed: 500,fade: true,cssEase: 'linear',swipe: false,swipeToSlide: false});
    $(".btn-slides").scroll(() => { var l = $(this).scrollLeft(); $(".btn-slides").scrollLeft();})
    $("#open-3d-modal").click(() => {
        gtag("event", "3d_opened", {
            model_name: getModelName(window.location.pathname)
        })
        $(".modal-pop-up._3d-model").removeClass("no-visible")
    })
    $("#close-3d-modal").click(() => {
        gtag("event", "3d_closed", {
            model_name: getModelName(window.location.pathname)
        })
        $(".modal-pop-up._3d-model").addClass("no-visible")
    })
    document.title = "Configurator"
})

function init(){
    var sections = { m : [], exterior : [], interior : [], layout : [], upgrades : [], services : [] }
    var currencys = []
    var activeLevel = []
    var activeOptionLevel = {
        slug : "",
        levels : [],
    }

    setTimeout(() => { $(".div-block-257").removeClass("hidden") }, 300)
    $(".models").each(function(){
        sections.m.push({type : $(this).data("type"), name : $(this).data("name"), slug : $(this).data("slug"), price : $(this).data("price"), image : $(this).data("image")})
    })
    $('.rendered-sections').each(function(){
        var data = $(this).data() 
        var type = data.type.toLowerCase()
        var description = $(this).closest(".w-dyn-item").find('.longer-description-html').html()
        var st = data.subtype
        var exist_subtype = sections[type].find(function(item){
            return item.subtype == st && item.active == true
        })
        var selection = data.selection.toLowerCase()
        selection = (selection.includes("simple") ? "simple" : "multiple")
        var active = !exist_subtype && selection == "simple" && data.parent == ""
        var labelLevels = []
        
        //var itt = {type : data.type, subtype : data.subtype, namesubtype : data.namesubtype, name : data.name, slug : data.slug, price : data.price,  image : data.image, thumbnail : data.thumbnail, description, active, show : false, order : data.order, selection : selection, object : data.object, group : data.group, material : data.material, function : data.function, parent : data.parent, childs : [], activeLevel : [] }
        var itt = data
        itt.description = description 
        itt.active = active
        itt.show = false,
        itt.selection = selection
        itt.childs = []
        itt.activeLevel = []
        sections[type].push(itt)
    })

    var childHtml = {
        "multiple" : [],
        "simple" : []
    }

    var typeItem = ["simple", "multiple"]
    for(var i in typeItem){
        var type = typeItem[i]

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
                if(it.childs.length > 0 && it.active && it.selection == "simple"){
                    it.childs[0].active = true
                }
            })

            section.map(function(tag){
                if(!subtypes.find(st => st.value === tag.subtype)){
                    var items = section.filter(st => st.subtype === tag.subtype && st.parent == "")
                    subtypes.push({value : tag.subtype, title : tag.namesubtype, items })
                }
            })

            subtypes.map(async function(st){
                activeLevel[st.value] = []
                
                for(var l in levels[st.items[0].selection]){
                    var itemsChilds = []
                    if(l == 0){ 
                        itemsChilds = (st.items[0].active == true) ? st.items[0].childs : []
                    }else{
                        var prveLevel = activeLevel[st.value][l - 1]
                        if(prveLevel && prveLevel.items.length > 0){
                            itemsChilds = (prveLevel.items[0].active == true) ? prveLevel.items[0].childs : []
                        }
                    }
                    
                    activeLevel[st.value].push({level : l, items : itemsChilds})
                }

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
                    $item.find('*[class^="box-level"]').each(function(){
                        $(this).remove()
                    })
                    for(var m = 0; m < childHtml[it.selection].length; m++){
                        var el = childHtml[it.selection][m]
                        var classList = $(el.html).find(".list").attr("class")
                        $(el.html).find(".list").remove()
                        var $itemChild = $(el.htmlchild)
                        $itemChild.find('.image').attr('x-bind:src', "option.thumbnail").attr("x-bind:srcset", "option.thumbnail")
                        $itemChild.find('.text-name').attr('x-text', "option.name")
                        $itemChild.find('.text-description').attr('x-text', "option.description")
                        $itemChild.find('.text-price').attr('x-text', "setCurrencyPrice(option.price, '+ $')")
                        $itemChild.attr("x-bind:id", "option.slug").attr("x-bind:data-type", "option.type").attr("x-bind:data-level", "'"+el.level+"'").attr("x-bind:class", "{'selected' : option.active}")
                        var childTemplate = `<template x-if="getShowLevel('${it.slug}', '${el.level}', '${it.type}') == true">
                        <div class="${classList}"><template role="listitem" x-for="option in activeLevel['${it.subtype}'][${m}].items" :key="option">
                        ${$itemChild[0].outerHTML}
                        </template></div></template>`
                        $item.append(el.html)
                        var titleLavel = (it["titlelavel"+el.level]) ? it["titlelavel"+el.level] : ""
                        $item.find(".box-level-"+el.level).find(".title-level").attr("x-show", `getShowLevel('${it.slug}', '${el.level}', '${it.type}') == true && activeLevel['${st.value}'][${m}].items.length > 0`)
                        $item.find(".box-level-"+el.level).find(".title-level").text(titleLavel)
                        $item.find(".box-level-"+el.level).append(childTemplate)

                    }

                    htmlItems += $item[0].outerHTML
                })
                htmlItems += '</div>'
                $parentHTML.find(".w-dyn-list").html(htmlItems)
                $('.'+s+' '+ccM).parent().append($parentHTML)
            })
        }    
    }
    
    $("input:required").attr("x-on:input", "validate()")
    $('form').attr("x-on:keydown.enter.prevent", "")
    $('#next-button').attr("href", "javascript:void(0)")
    $('form').attr("x-on:submit", "submit(event)")
    $(".currency-link").each(function(){
        var dataC = $(this).parent().find('.currency').data()
        $(this).attr("x-on:click", `changeCurrency('${dataC.currency}')`)
        currencys[dataC.currency] = dataC.value
    })

    // $(".p-currency").each(function(){
    //     var text = $(this).text()
    //     $(this).attr('x-text', `setCurrencyPrice('${text}')`)
    // })
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
        activeLevel : activeLevel,
        runScript : false,
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
        },
        setStudio : function(event){
            if(!this.runScript){
                this.runScript = true
                var target = event.target
                var $target = $(target).closest(".parent")
                var $child = null

                if($target.length == 0){
                    $child = $(event.target).closest(".collection-item-5")
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
                            if(item.childs.length > 0 && item.active === false){
                                if(item.childs.length > 0){
                                    for(c in item.childs){
                                        item.childs[c].active = false
                                    }
                                }
                            }
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

                    for(var l = 0; l < levels[item.selection].length; l++){
                        this.activeLevel[item.subtype][l].items = []
                    }

                    if(item.childs.length > 0 && item.active == true && item.selection == "simple"){
                        item.childs[0].active = true

                    }
                    
                    for(var l in levels[item.selection]){
                        var itemsChilds = []
                        if(l == 0){ 
                            itemsChilds = (item.active == true) ? item.childs : []
                        }else{
                            var prveLevel = activeLevel[item.subtype][l - 1]
                            if(prveLevel && prveLevel.items.length > 0){
                                itemsChilds = (prveLevel.items[0].active == true) ? prveLevel.items[0].childs : []
                            }
                        }
                        
                        if(itemsChilds.length > 0 && item.selection == "simple"){
                            itemsChilds[0].active = true
                        }
                        this.activeLevel[item.subtype][l].items = itemsChilds
                    }



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
                    setTimeout(function(){
                        _this.renderSelection()
                        _this.setPrice()
                    }, 300)

                }else if($child.length > 0){
                    var slug = $child.attr("id")
                    var type = $child.data("type").toLowerCase()
                    var level = $child.data("level").toLowerCase()
                    var tag = sections[type]
                    var item = tag.find(function(i){ return i.slug == slug })

                    // if(item.selection == "multiple"){
                    //     $child.toggleClass("selected")

                    // }else if(item.selection == "simple")
                    $child.parent().find(".collection-item-5").removeClass("selected")
                    $child.addClass("selected")
                    //   }

                    var subtype = item.subtype
                    var _this = this
                    this.studio[type].selected.map(function(i){
                        if(i.subtype == item.subtype )//&& item.selection == "simple"
                            i.active = false
                        return i
                    })
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
                        if(item.selection == "simple"){
                            item.childs[0].active = true
                        }
                    }

                    setTimeout(function(){
                        _this.renderSelection()
                        _this.setPrice()
                    }, 200)
                }

                var _this = this
                setTimeout(function(){
                    _this.runScript = false
                }, 120)

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
                            if(itemJ.active === true)
                                total = parseFloat(total) + parseFloat(itemJ.price)
                        }
                    }
                }
            }
            try {
                var address = document.getElementById('Address').value.trim();
                var city = document.getElementById('City').value.trim();
                var state = document.getElementById('State').value.trim();

                const modelName = getModelName(window.location.pathname)
                const pricePerMile = lookup[modelName]["price-per-mile"]

                const service = new google.maps.DistanceMatrixService();

                if (address !== "" && city !== "" && state !== "") {
                    var dest = "";
                    dest += address + "," + city + "," + state

                    service.getDistanceMatrix({
                        origins: ["9424 W Walton, Blanchard, MI", "5617 104th Pl NE, Marysville, WA"],
                        destinations: [dest],
                        unitSystem: google.maps.UnitSystem.IMPERIAL,
                        travelMode: google.maps.TravelMode.DRIVING,
                        avoidHighways: false,
                        avoidTolls: false,
                    }, (response, status) => {
                        if (status == "OK") {

                            const michiganResult = pricePerMile * parseMiles(response.rows[0].elements[0].distance.text)
                            const washingtonResult = pricePerMile * parseMiles(response.rows[1].elements[0].distance.text)

                            var price = michiganResult < washingtonResult ? michiganResult : washingtonResult;

                            if (modelName === "the-twelve") {
                                if (price < 600) {
                                    price = 600
                                }
                                else if (price > 3600) {
                                    price = 3600
                                }

                            }
                            else if (modelName === "the-sixteen") {
                                if (price < 800) {
                                    price = 800
                                }
                                else if (price > 4250) {
                                    price = 4250
                                }
                            }

                            if (this.currency === "CAD") {
                                price += 250
                            }

                            shippingCost = price
                            total = parseFloat(total) + price
                            this.studio.price = formatter.format(this.setCurrencyPrice(total))
                            this.setLoan(total)
                            totalPrice = total;
                            this.renderSelection()
                        }
                    })
                } else {
                    total = parseFloat(total) + parseFloat(this.shipping)
                    this.studio.price = formatter.format(this.setCurrencyPrice(total))
                    this.setLoan(total)
                    totalPrice = total
                }
            } catch (error) {
                total = parseFloat(total) + parseFloat(this.shipping)
                this.studio.price = formatter.format(this.setCurrencyPrice(total))
                this.setLoan(total)
                totalPrice = total
            }
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
            var slideName = slidesT[this.slideActive]

            if (slideName === "size") {
                slideName = "model"
            }

            gtag("event", slideName + "_next_clicked", {
                model_name: getModelName(window.location.pathname)
            })

            if (slide == 'next'){ slide = (this.valid) ? parseInt(this.slideActive) + 1 : this.slideActive }
            this.valid = true
            var inputs = $("input:required").filter(function(i, elem){
                return $(elem).val() == ""
            })
            if (slide == this.summarySlide){
                if (inputs.length > 0){
                    this.valid = false
                }
                else {
                    this.valid = true
                    this.setPrice()

                    if (isTakeRateModel()) {
                        createOrUpdatePaymentIntent()
                    } else {
                        // Right now this is only Drop Structure for Holo. 1k deposit.
                        document.getElementById("deposit-price").innerHTML = formatter.format(1000)
                        document.getElementById("checkout-button-price").value = "Submit"
                    }
                }
            }
            if (this.valid) { $("#slick-slide-control0"+slide).click() }
            if (slide == this.installationSlide  && inputs.length > 0) this.valid = false
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
                        var items = item.selected.filter(function(iJ){ return iJ.active })
                        for (const j in items) {
                            value.push(items[j].name)
                            let renderitem = { type: items[j].type, name : items[j].name, slug : items[j].slug, price : items[j].price, image : (items[j].image) ? items[j].image : null, thumbnail : (items[j].thumbnail) ? items[j].thumbnail : null}
                            this.studioItems.push(renderitem)
                        }
                        this[i+"V"] = value.join(", ")
                    }
                }
            }

            var localizedCost = this.currency === "CAD" ? shippingCost / currencys["CAD"] : shippingCost
            const defaultShipText = "Estimated shipping"
            var shipText = shippingCost ? "Shipping cost: " + formatter.format(localizedCost) : defaultShipText
            if (shipText !== defaultShipText) {
                this.studioItems.push({type : "shipping", name : shipText, price : this.shipping,  image : "", thumbnail : imgshipping})
            }
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
        //submit : function(event){
        //    var data = $('form').serialize()
        //    data = window.btoa(data)
        //    var sTags = JSON.stringify(this.studioItems)
        //    var t = window.btoa(sTags)
        //    $( document ).ajaxComplete(function() { window.location.href = "/thank-you?s="+data+"&t="+t });
        //    return false
        //},
        submit : function(event){

            const model = getModelName(window.location.pathname)

            if (isTakeRateModel()) {
                gtag("event", "clicked_make_purchase", {
                    model_name: model
                })
                stripeMakePayment(stripeCard, stripePaymentIntentSecret)

            } else {
                gtag("event", "clicked_submit_nontake", {
                    model_name: model
                })
                setTimeout(() => {
                    window.location.href = "https://" + window.location.hostname + "/thank-you"
                }, 2000)
            }
        },
        changeCurrency : function(c){
            this.currency = c
            this.setPrice()
            $(document).find('.w-dropdown').each(function (i, el) {
                $(el).triggerHandler('w-close.w-dropdown');
            });
        },
        setCurrencyPrice: function(p, symbol = ""){return symbol + " " + (p / currencys[this.currency]).toFixed(0) },
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
