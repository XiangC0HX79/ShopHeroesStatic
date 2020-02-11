// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

function initCookie() {

    if (!$.cookie('Mastered') || isNaN(parseInt($.cookie('Mastered')))) {
        $.cookie('Mastered', 1, { expires: 7, path: '/' });
    }

    if (!$.cookie('Mastery') || isNaN(parseInt($.cookie('Mastery')))) {
        $.cookie('Mastery', 0, { expires: 7, path: '/' });
    }

    try {
        if (!Array.isArray(JSON.parse($.cookie('Skills')))) {
            $.cookie('Skills', JSON.stringify([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), { expires: 7, path: '/' });
        }
    } catch (e) {
        $.cookie('Skills', JSON.stringify([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), { expires: 7, path: '/' });
    }
}

function getCookieMastery() {
    return parseInt($.cookie('Mastery'));
}

function setCookieMastery() {
    var mastery = parseInt($('input#details-mastery').val());

    $.cookie('Mastery', mastery, { expires: 7, path: '/' });

    return mastery;
}

function getCookieMastered() {
    return parseInt($.cookie('Mastered')) > 0;
}

function setCookieMastered(ref) {
    var mastered = $(ref).prop('checked');

    $.cookie('Mastered', mastered ? 1 : 0, { expires: 7, path: '/' });

    return mastered;
}

function getCookieSkills() {
    return JSON.parse($.cookie('Skills'));
}

function setCookedSkills(ref) {
    var skills = JSON.parse($.cookie('Skills'));

    $(ref).find('input.input-skill').each((id, item) => {
        const i = $(item).attr('name');
        const v = $(item).val();
        skills[i] = v ? parseInt(v) : 0;
    });

    $.cookie('Skills', JSON.stringify(skills), { expires: 7, path: '/' });

    return skills;
}

$(function () {
    initCookie();   
})

items = {
    itemscmp: null,

    updatedatas() {
        const mastered = getCookieMastered();

        const skills = getCookieSkills();

        $('input[id$="mastered"]').bootstrapToggle(mastered ? 'on' : 'off', true);

        $.each($('#modal_skills').find('input.input-skill'), (id, item) => {
            const i = $(item).attr('name');
            $(item).val(skills[i]);
        });

        itemscmp.invokeMethod("UpdateItemsData", mastered, skills);
        //itemscmp.invokeMethodAsync("UpdateItemsData")
        //    .then(_ => { });
    },
    
    init(cmp) {
        itemscmp = cmp;
    }
}

itemlist = {
    listcmp: null,

    formfilterinit() {
        $("#filter_level").ionRangeSlider({
            type: "double",
            min: 1,
            max: 60,
        });
    },

    formfiltershow(minlevel,maxlevel) {
        const filterLevel = $("#filter_level").data("ionRangeSlider");

        filterLevel.update({
            from: minlevel,
            to: maxlevel,
        });
    },

    formfiltersubmit() {
        const filterLevel = $("#filter_level").data("ionRangeSlider");
        return { MinLevel: filterLevel.result.from, MaxLevel: filterLevel.result.to };
    },

    formsortshow(sort) {
        $('#modal_sort').find('input[value=' + sort + ']').prop('checked', true);
    },

    formskillshow() {
        var skills = getCookieSkills();

        $.each($('#modal_skills').find('input.input-skill'), (id, item) => {
            const i = $(item).attr('name');
            $(item).val(skills[i]);
        });
    },
    
    formskillsubmit() {
        setCookedSkills($('#modal_skills'));

        items.updatedatas();
    },

    rowinit() {
        $('#item-scroll').find('[data-toggle="tooltip"]').tooltip('dispose');
        $('#item-scroll').find('[data-toggle="tooltip"]').tooltip();
    },
    
    togglemastered() {
        setCookieMastered($(this));

        items.updatedatas();
    },

    updatetext() {
        listcmp.invokeMethod("UpdateText", $("#input-name").val());
    },

    updatesize() {
        listcmp.invokeMethod("UpdateSize", $('#item-scroll')[0].scrollTop, $('#item-scroll')[0].clientHeight);
    },

    inputSkill() {
        let value = $(this).val();

        value = value.replace(/[^\d]/g, '')

        if (isNaN(value) || value <= 0) {
            value = 0;
            $(this).val(0);
        }

        if (value > 1000) {
            value = 1000;
            $(this).val(1000);
        }
    },

    init(cmp) {
        listcmp = cmp;

        $(window).on('resize', throttling(itemlist.updatesize, 500));

        $('#item-scroll').bind('scroll', throttling(itemlist.updatesize, 500));

        $('#modal_skills').find('input.input-skill').bind('input', itemlist.inputSkill);


        $("#input-name").bind('compositionstart', e => {
            $("#input-name").unbind('input');
        });

        $("#input-name").bind('compositionend', e => {
            $("#input-name").bind('input', throttling(itemlist.updatetext, 500));
        });

        $("#input-name").bind('compositionend', throttling(itemlist.updatetext, 500));

        $("#input-name").bind('input', throttling(itemlist.updatetext, 500));


        $('input#list-mastered').bootstrapToggle(getCookieMastered() ? 'on' : 'off', true);

        $('input#list-mastered').bind('change', itemlist.togglemastered);
    },
}

var isthrottlingfirst = true;

function throttling(fn, wait) {
    var timeout = null,
        startTime = new Date();

    return function () {
        var context = this,
            args = arguments,
            curTime = new Date();

        clearTimeout(timeout);

        if (isthrottlingfirst) {
            isthrottlingfirst = false;
            startTime = curTime;
            timeout = setTimeout(e => { isthrottlingfirst = true; fn.apply(context, args); }, wait);
        }
        else {
            if (curTime - startTime >= wait) {
                fn.apply(context, args);
                startTime = curTime;
            } else {
                timeout = setTimeout(e => { isthrottlingfirst = true; fn.apply(context, args); }, wait);
            }
        }
    }
}

itemDetail = {
    detailCmp: null,

    init(cmp) {
        detailCmp = cmp;

        $('input#details-mastered').bootstrapToggle(getCookieMastered()?'on':'off',true);
        
        $('input#details-mastered').bind('change', itemDetail.toggleMastered);


        $('input#details-mastery').val(getCookieMastery());

        $('input#details-mastery').bind('input', itemDetail.inputMastery);
    },

    rowinit() {
        var skills = getCookieSkills();

        $.each($('#item-details').find('input.input-skill'), (id, item) => {
            const i = $(item).attr('name');
            $(item).val(skills[i]);
        });
        
        $('#item-details').find('input.input-skill').unbind('input'); 
        $('#item-details').find('input.input-skill').bind('input', itemDetail.inputSkill);
        
        $('#item-details').find('[data-toggle="tooltip"]').tooltip('dispose');
        $('#item-details').find('[data-toggle="tooltip"]').tooltip();
    },

    toggleMastered() {
        setCookieMastered($(this));

        items.updatedatas();
    },

    inputSkill() {
        let value = $(this).val();

        value = value.replace(/[^\d]/g, '')

        if (isNaN(value) || value <= 0) {
            value = 0;
            $(this).val(0);
        }

        if (value > 1000) {
            value = 1000;
            $(this).val(1000);
        }

        setCookedSkills($('#item-details'));

        items.updatedatas();
    },

    inputMastery() {
        let value = $(this).val();

        value = value.replace(/[^\d]/g, '')

        if (isNaN(value) || value <= 0) {
            value = 0;
            $(this).val(0);
        }

        var mastery = setCookieMastery();

        detailCmp.invokeMethod("UpdateMastery", mastery);
    },
}