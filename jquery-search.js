$.fn.metaSearch = function(args){

  var E = {}

  E.inpt = $(this);
  var el_id = typeof E.inpt.attr('id') !== 'undefined'? '#' + E.inpt.attr('id'): '[name=' + E.inpt.attr('name') + ']';

  var init = function(){

    args.fields = M.filter(args.fields, function(v){

      return (v !== '');

    });

    E.inpt.hide();

    E.inpt.wrap('<div class="search-wrap" data-target="' + el_id + '"></div>');

    E.wrap            = E.inpt.parent('.search-wrap');
    E.wrap.fake       = $('<div/>', {'class': 'search-wrap-fake'});
    E.wrap.fake.field = $('<div/>', {'class': 'search-use-field'});
    E.wrap.fake.el    = $('<div/>', {'class': 'search-fake', 'contenteditable': 'true'});
    E.wrap.res        = $('<div/>', {'class': 'search-res'});
    E.wrap.suggest    = $('<div/>', {'class': 'search-suggest', 'style': 'display: none;'});

    E.wrap.fake.el.keypress(function(e){

      if(e.which == 13) {

        if(E.wrap.fake.el.html() !== '' && !priv.choosing){

          M.do_search.apply(this, [e]);

        }
        priv.choosing = false;

        return false

      }

    });

    E.wrap.fake.el.keydown(function(e){


      if(e.which == 38 && priv.canChoose){

        var fields = E.wrap.suggest.find('.search-field');
        var last_field = fields.last();
        var selected   = E.wrap.suggest.find('.selected').length > 0? E.wrap.suggest.find('.selected'): last_field;

        fields.removeClass('selected');


        if(selected.prev().length == 0){

          last_field.addClass('selected');

        } else {

          selected.prev().addClass('selected');

        }

        priv.choosing = true;

      } else if(e.which == 40 && priv.canChoose){

        var fields      = E.wrap.suggest.find('.search-field');
        var first_field = fields.first();
        var selected    = E.wrap.suggest.find('.selected').length > 0? E.wrap.suggest.find('.selected'): first_field;

        fields.removeClass('selected');


        if(selected.next().length == 0){

          first_field.addClass('selected');

        } else {

          selected.next().addClass('selected');

        }

        priv.choosing = true;

      } else if(e.which == 13 && priv.canChoose) {

        var selected = E.wrap.suggest.find('.selected')[0];

        if(priv.choosing && typeof selected !== 'undefined'){

          M.do_search_with.apply(selected, [null]);

        }

      } else if(e.which == 27) {

        if(priv.canChoose){

          E.wrap.suggest.hide();
          priv.canChoose = false;

        } else if(E.wrap.fake.is('.is-search') && E.wrap.fake.el.html() == '') {

          E.wrap.fake.field.html('');
          E.wrap.fake.field.css('visibility', 'hidden');
          E.wrap.fake.removeClass('is-search')

        }

      } else if(e.which == 8) {

        if(E.wrap.fake.el.html() == '') {

          E.wrap.fake.field.html('');
          E.wrap.fake.field.attr('data-label', '  ');
          E.wrap.fake.field.css('visibility', 'hidden');
          E.wrap.fake.removeClass('is-search')

        }

      }

    });

    E.wrap.fake.el.keyup(function(e){

      if([38, 40, 13, 27].indexOf(e.which) > -1) return false;


      var value = $(this).html().trim();

      if(!E.wrap.fake.is('.is-search') && M.is_search(value)){

        priv.canChoose = true;
        M.get_fields.apply(this, [e]);

        var fields      = E.wrap.suggest.find('.search-field');
        var first_field = fields.first().next();

        first_field.addClass('selected');

        priv.choosing = true;

      }

      if(value == ''){

        E.wrap.suggest.hide();
        priv.canChoose = false;

      }

    });


    $(document).click(function(e){
      var target = $(e.target);

      if(!target.is('.search-opt-wrap, .search-opt-wrap *')){

        E.wrap.find('.search-opt-wrap').removeClass('opened');

      }


      if(!target.is('.search-suggest, .search-suggest *, .search-wrap-fake, .search-fake')){

        priv.canChoose = false;
        E.wrap.suggest.hide();

      } else if(target.is('.search-wrap-fake, .search-fake') && !E.wrap.fake.is('.is-search') && M.is_search(E.wrap.fake.el.html().trim())){

        M.get_fields(null);

      }


    });

    E.wrap.fake.field.click(function(e){

        e.stopPropagation();

        M.get_fields.apply(this, [e, true]);
        E.wrap.fake.el.focus();

        priv.canChoose = true;

    });

    E.wrap.fake.append(E.wrap.fake.field, E.wrap.fake.el);
    E.wrap.append(E.wrap.fake, E.wrap.suggest, E.wrap.res);

    if(typeof args.search_opts !== 'undefined' && Object.keys(args.search_opts).length > 0) {

      E.wrap.addClass('using-options');


      var search_opts = args.search_opts;
      var options     = search_opts.options;
      var selected    = search_opts.selected;

      var opts_wrap   = $('<div/>', {'class': 'search-opt-wrap'});
      var opt_choose  = $('<div/>', {'class': 'search-opt-choose fa fa-chevron-down', 'html': '<span>&nbsp;</span>'});
      var opts_field  = $('<div/>', {'class': 'search-opt-fields'});

      var opts_inpt   = $('<input>', {'class': 'search-opt-inpt', 'type': 'hidden', 'value': selected, 'name': args.name + '_opt'});

      opt_choose.click(function(e){

        if(opts_wrap.is('.opened')){

          opts_wrap.removeClass('opened');

        } else {

          opts_wrap.addClass('opened');

        }

      });

      opts_wrap.append(opt_choose, opts_field);
      E.wrap.fake.append(opts_wrap);
      E.wrap.append(opts_inpt);


      if(Object.keys(options).length > 0){


        $.each(options, function(key, option){

          var field_opt = $('<div/>', {

            'class'      : 'search-opt-field ' + (key == selected? 'selected': ''),
            'html'       : option.label,
            'data-value' : option.value,
            'data-key'   : key,

          });

          field_opt.click(function(e){

            var opt = $(this);

            var opt_choose_lb = opt_choose.find('span');

            opt_choose_lb.html(opt.attr('data-value'));
            opt_choose_lb.attr('data-label', opt.html());
            opts_field.find('.search-opt-field').removeClass('selected')
            opt.addClass('selected');

            opts_wrap.removeClass('opened');

            opts_inpt.val(key);

          });

          if(key == selected){


            var opt_choose_lb = opt_choose.find('span');

            opt_choose_lb.html(field_opt.attr('data-value'));
            opt_choose_lb.attr('data-label', field_opt.html());
            opts_field.find('.search-opt-field').removeClass('selected')
            field_opt.addClass('selected');


          }

          opts_field.append(field_opt);

        });


      }



    }

    if(typeof args.search_terms !== 'undefined' && Object.keys(args.search_terms).length > 0){

      $.each(args.search_terms, function(k, v){

        len = priv.field_id || 0;


        var regexRM = eval("/^\\" + args.keyDispatch + "/");
        var regexEx = eval("/^\\" + args.keyDispatch + "(.*?):.*/");
        var field_html, val_html, field_show;
        var prefix = '';

        if(v.match(regexEx)){

          var field = v.split(':');

          field_html = field[0].replace(regexRM, '');
          val_html   = field[1];


          if(typeof args.fields[field_html] !== 'undefined'){

            field_show = args.fields[field_html] + ': ';

          } else {

            field_show = field_html + ': ';

          }

          if(field_html !== ''){
            prefix = args.keyDispatch;
          }

          field_html += ':';

        } else {


          field_html = '';
          field_show = '';
          val_html   = v;

        }


        var res_child = $('<div/>', {
          'class'      : 'search-res-child',
          'data-label' : field_html,
          'data-val'   : val_html,
          'data-id'    : len,
          'html'       : field_show + val_html,
          'title'      : field_show + val_html
        });


        var res_child_rm = $('<i>', {
          'class'   : 'search-res-remove fa fa-times',
          'data-id' : len,
          'value'   : ''
        });

        var res_child_inpt = $('<input>', {
          'class'   : 'search-res-inpt',
          'type'    : 'hidden',
          'name'    : args.name + '[]',
          'value'   : prefix + field_html + val_html,
          'data-id' : len,
          'form'    : args.form
        });

        res_child_rm.click(M.remove_field);

        res_child.append(res_child_rm);
        E.wrap.res.append(res_child, res_child_inpt);

        priv.field_id++;

      });

    }


  }

  var def_args = {
    'fields'      : {},
    'name'        : E.inpt.attr('name'),
    'keyDispatch' : '+'
  };

  args = $.extend(def_args, args);

  if(typeof args.datalist !== 'undefined'){

    var datalist_fields = {};

    args.datalist.find('option').each(function(){

      var el = $(this);
      datalist_fields[el.val()] = el.html();
    })

    args.fields = datalist_fields;

  }

  var M = {

    get_fields : function(e, use_blank_html){

      use_blank_html = use_blank_html || false;

      var search = '';

      if(!use_blank_html){

        search = E.wrap.fake.el.html();
        search = search.toLowerCase().replace(args.keyDispatch, '');

      }


      var fields = M.get_fields_with(search);

      E.wrap.suggest.html('');

      var field_blank = $('<div/>', {'class': 'search-field search-field-blank', 'data-label' : 'Limpar', 'html': ''});

      field_blank.click(function(e){
        M.do_search_with.apply(this, [e, use_blank_html]);
      });

      E.wrap.suggest.append(field_blank);


      for(var field_k in fields){

        var field = fields[field_k]
        var field_html;

        if($.isArray(fields)){

          field_html = $('<div/>', {'class': 'search-field', 'data-label' : '', 'html': field + '<span>&nbsp;</span>'});

        } else {

          field_html = $('<div/>', {'class': 'search-field', 'data-label' : field, 'html': field_k + '<span>' + field + '</span>'});

        }


        field_html.click(function(e){

          M.do_search_with.apply(this, [e, use_blank_html]);

        });

        field_html.mouseenter(function(e){

          E.wrap.suggest.find('.search-field').removeClass('selected');
          $(this).addClass('selected');

        });

        E.wrap.suggest.append(field_html);



      }

      E.wrap.suggest.show();

    },

    get_fields_with : function(search){


      var t_fields = args.fields;
      if($.isArray(t_fields)){

        var fields = [];

        for(var k in t_fields) {

          var v = t_fields[k];

          if(v.toLowerCase().indexOf(search) > -1){

            if(search != args.keyDispatch){

              v = M.mark_field(v, search);


            }

            fields.push(v);

          }
        }

      }else {

        var fields = {};

        for(var k in t_fields) {

          var v = t_fields[k];
          if(k.toLowerCase().indexOf(search) > -1 || v.toLowerCase().indexOf(search) > -1){

            var key = k, val = v;

            if(search != args.keyDispatch){

              key = M.mark_field(k, search);
              val = M.mark_field(v, search);


            }

            fields[key] = val;

          }
        }

      }

      return fields;

    },

    do_search : function(e){

      var field_html = (E.wrap.fake.field.html() || '').trim(),
          val_html   = (E.wrap.fake.el.html()     || '').trim();

      var field_show = E.wrap.fake.field.attr('data-label') || '';

      var child_html = '';

      var len = priv.field_id;

      var prefix = '';

      if(field_html !== ''){

        prefix = args.keyDispatch;

      }

      if(field_show !== '') {

        child_html = field_show + val_html;

      } else {

        child_html = field_html + val_html;

      }

      var res_child = $('<div/>', {
        'class'      : 'search-res-child',
        'data-label' : field_html,
        'data-val'   : val_html,
        'data-id'    : len,
        'html'       : child_html,
        'title'      : child_html
      });


      var res_child_rm = $('<i>', {
        'class'   : 'search-res-remove fa fa-times',
        'data-id' : len,
        'value'   : ''
      });

      var res_child_inpt = $('<input>', {
        'class'   : 'search-res-inpt',
        'type'    : 'hidden',
        'name'    : args.name + '[]',
        'value'   : prefix + field_html + val_html,
        'data-id' : len,
        'form'    : args.form
      });

      res_child_rm.click(M.remove_field);

      $(this).html('');
      E.wrap.fake.field.html('').css('visibility', 'hidden');
      E.wrap.suggest.hide();
      E.wrap.fake.removeClass('is-search');

      res_child.append(res_child_rm);
      E.wrap.res.append(res_child, res_child_inpt);
      E.wrap.fake.field.attr('data-label', '')

      priv.canChoose = false;
      priv.field_id++;

    },

    do_search_with : function(e, use_blank_html){

      use_blank_html = use_blank_html || false;

      var field_el = $(this),
          field    = field_el.html(),
          field_lb = field_el.data('label');

      if(field !== ''){
        E.wrap.fake.field.css('visibility', 'visible')

        E.wrap.fake.field.html(field + ': ');
        if(field_lb !== ''){

          E.wrap.fake.field.attr('data-label', field_lb + ': ');

        } else {

          E.wrap.fake.field.attr('data-label', '');

        }
        E.wrap.fake.addClass('is-search');

      } else {

        E.wrap.fake.field.css('visibility', 'hidden')
        E.wrap.fake.field.html('');
        E.wrap.fake.field.attr('data-label', '');
        E.wrap.fake.removeClass('is-search');

      }

      E.wrap.fake.el.focus();

      if(!use_blank_html) {

        E.wrap.fake.el.html('');

      }

      field_el.parent('.search-suggest').hide();
      priv.canChoose = false;

    },

    remove_field : function(e) {

      var id  = $(this).data('id');

      E.wrap.res.find('.search-res-child[data-id="' + id + '"]').remove();
      E.wrap.res.find('.search-res-inpt[data-id="' + id + '"]').remove();


    },

    mark_field : function(value, mark) {

        var regex = new RegExp('(' + mark + ')', 'gi');
        return value.replace(regex, "<strong>$1</strong>");

    },

    is_search : function(value) {

        var regex = eval("/^\\" + args.keyDispatch + "/");
        return regex.test(value);

    },

    filter : function(obj, predicate) {

      var result = $.isArray(obj)? []: {};

      for (var key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) {

          if($.isArray(obj)){

            result.push(obj[key]);

          } else {

            result[key] = obj[key];

          }

        }
      }

      return result;
    },

    map : function(obj, predicate) {

      var result = {};

      for (var key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) {
          result[key] = predicate(key, obj[key]);
        }
      }

      return result;
    },


  };

  var priv = {

    choosing  : false,
    canChoose : false,
    field_id  : 0

  }

  String.prototype.capitalize = function(){
    var str = this;

    str = str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
      return letter.toUpperCase();
    });

    return str;
  }

  String.prototype.upperFirst = function(){
    var str = this;

    str = str.toLowerCase().replace(/\b[a-z]/, function(letter) {
      return letter.toUpperCase();
    });

    return str;
  }

  return init();

};
