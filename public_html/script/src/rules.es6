'use strict';
import {default as $} from 'jquery';

$('#rules div.slider').each(function() {
    //Set up the slider to slide when the buttons are pressed
    let pos = 0;
    let hoverLeft = () => pos - 10;
    let hoverRight = () => pos + 10;
    let nextLeft = () => pos = Math.max(Math.min(0, $(this).outerWidth() - (1 + $(this).children('.inner').children('div').length) * 170), pos - 170);
    let nextRight = () => pos = Math.min(0, pos + 170);
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
$('#rules div.space-type')
    .click(function() {
        $(`#rules div.rule[name='${$(this).attr('name').replace(/(paddy|mountain|sea)/, 'panorama').replace(/(farm|temple)/,'coins')}']`)[0]
            .scrollIntoView();
    });

//Close the rules when close is clicked
$('#rules div#button-rules')
    .click(() => {
        $('#rules').css({
            opacity: 0,
            'pointer-events': 'none'
        });
    });