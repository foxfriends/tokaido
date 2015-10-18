'use strict';
import {default as $} from 'jquery';

//Move around the menu pieces
$('#title').css('opacity', 1);
window.setTimeout(() => {
    $('#title h1,#title h3').css('opacity', 1);
    window.setTimeout(() => {
        $('#title h2').css({
            opacity: 1,
            cursor: 'pointer'
        }).click(function() {
            $(this)
                .css({
                    opacity: 0,
                    cursor: 'default'
                })
                .off('click');
            $('#title input').on('input', function() {
                $(this).removeClass('error');
            });
            $('#title input#game')
                .css('top', '200px')
                .attr('tabindex', 1)
                .focus();
            window.setTimeout(() => {
                $('#title input#name')
                    .css('top', '300px')
                    .attr('tabindex', 2);
            }, 700);
            window.setTimeout(() => {
                $('#title div.button')
                    .css('top', '400px')
                    .attr('tabindex', 3)
                    .click(() => {
                        let game = $('#game').val();
                        let name = $('#name').val();
                        if(game === "" || game.length > 80) { return $('#game').addClass('error').focus(); }
                        if(name === "" || name.length > 80) { return $('#name').addClass('error').focus(); }


                    });
            }, 1400);
        });
    }, 1000);
}, 1000);