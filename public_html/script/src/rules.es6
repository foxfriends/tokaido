'use strict';
import {default as $} from 'jquery';

export let showRules = (expansions) => {
    $('#rules').css({
        top: 0,
        opacity: 1,
        'pointer-events': 'auto'
    });
    if(expansions !== undefined) {
        if(expansions.crossroads) {
            $('#rules>.container').animate({
                scrollTop: $('#rules>.container')[0].scrollHeight
            }, 3000);
            $('#rules-crossroads')
                .css('max-height', 'none');
            $('#button-crossroads')
                .css({
                    opacity: 0,
                    'pointer-events': 'none'
                });
        }
    }
    $('#rules-crossroads')
        .css('display', 'block');
};
export let hideRules = () => {
    $('#rules').css({
        top: -100,
        opacity: 0,
        'pointer-events': 'none'
    });
    window.setTimeout(() => {
        $('#rules').scrollTop(0);
        $(`#rules-crossroads`)
            .css({
                'max-height': 0
            });
        $('#button-crossroads')
            .css({
                opacity: 1,
                'pointer-events': 'inherit'
            });
    }, 2000);
};

$('#rules div.slider').each(function() {
    //Set up the slider to slide when the buttons are pressed
    let pos = 0;
    let hoverLeft = () => pos - 10;
    let hoverRight = () => pos + 10;
    let nextLeft = () => pos =
            Math.max(Math.min(0,
                            $(this).outerWidth() - (1 + $(this).children('.inner').children('div').length) *
                                                        $(this).children('.inner').children('div').outerWidth(true)),
                    pos - $(this).children('.inner').children('div').outerWidth(true));
    let nextRight = () => pos = Math.min(0, pos + $(this).children('.inner').children('div').outerWidth(true));
    let $movers = $(this).children('.mover');
    $movers.eq(0)
        .mouseover(() => {
            $(this)
                .children('.inner')
                .css('left', hoverRight());
        })
        .mouseout(() => {
            $(this)
                .children('.inner')
                .css('left', pos);
        })
        .click(() => {
            $(this)
                .children('.inner')
                .css('left', nextRight());
        });
    $movers.eq(1)
        .mouseover(() => {
            $(this)
                .children('.inner')
                .css('left', hoverLeft());
        })
        .mouseout(() => {
            $(this)
                .children('.inner')
                .css('left', pos);
        })
        .click(() => {
            $(this)
                .children('.inner')
                .css('left', nextLeft());
        });
});

//Scroll to the section about scoring when a space type is clicked
$('#rules .container').each(function() {
    $(this).children('div.space-type')
        .click(function() {
            console.log($(this).parent().parent().parent()
                    .children(`div.rule[name='${$(this).attr('name').replace(/(paddy|mountain|sea)/, 'panorama')}']`)
                    .position().top);
            $('#rules>.container').animate({
                scrollTop: $('#rules>.container').scrollTop() + $(this).parent().parent().parent()
                        .children(`div.rule[name='${$(this).attr('name').replace(/(paddy|mountain|sea)/, 'panorama')}']`)
                        .position().top
            }, 1500);
        });
});

// Actions for various buttons

//Open the crossroads expansion
$('#button-crossroads')
    .click(() => {
        showRules({crossroads: true});
    });
// Close the rules
$('#button-rules')
    .click(() => {
        hideRules();
    });

const F1 = 112;
$(window).keydown((e) => {
    if(e.which === F1) {
        showRules();
    }
});