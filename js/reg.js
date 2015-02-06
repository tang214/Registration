var _id = null;

function show_tab(e)
{
    e.preventDefault();
    if($(e.target).parent().filter('.disabled').length === 0)
    {
        $(this).tab('show');
    }
}

function tab_changed(e)
{
    var tab_index = $(e.target).parent().index();
    if(tab_index == 0)
    {
        $('.previous').attr('class', 'previous disabled');
    }
    else
    {
        $('.previous').attr('class', 'previous');
    }
    var last_index = $(e.target).parent().siblings().last().index();
    if(tab_index >= last_index)
    {
        $('.next').html('<a onclick="final_post(event)">Submit</a>');
    }
    else
    {
        $('.next').html('<a href="#">Next <span aria-hidden="true">&rarr;</span></a>');
    }
}

function prev_tab(e)
{
    $('li.active').prevAll(":not('.disabled')").first().contents().tab('show');
}

function validate_current()
{
    var ret = true;
    var required = $('div.tab-pane.active').find('[required]');
    if(required.length == 0) return true;
    for(i = 0; i < required.length; i++)
    {
        var control = $(required[i]);
        var value = control.val()
        if(value == null || value.length == 0)
        {
            control.parents('.form-group').prop('class', 'form-group has-error');
            ret = false;
        }
        else
        {
            control.parents('.form-group').prop('class', 'form-group has-success');
        }
    }
    return ret;
}

function post_done(data)
{
    if(data._id !== undefined)
    {
        _id = data._id; 
    }
}

function final_post_done(data)
{
    console.log(data);
}

function post_data()
{
    console.trace();
    var data = form_data_to_obj();
    data['_id'] = _id;
    $.ajax({
        url: 'ajax/proxy.php',
        type: 'post',
        dataType: 'json',
        data: data,
        success: post_done
    });
}

function final_post(e)
{
    e.preventDefault();
    if(validate_current())
    {
        var data = form_data_to_obj();
        data['_id'] = _id;
        $.ajax({
            url: 'ajax/proxy.php',
            type: 'post',
            dataType: 'json',
            data: data,
            success: final_post_done
        });
    }
    return false;
}

function next_tab(e)
{
    if(validate_current())
    {
        $('li.active').nextAll(":not('.disabled')").first().contents().tab('show');
        post_data();
    }
}

function tabcontrol_change()
{
    var control = $(this);
    var tab_id  = control.data('tabcontrol');
    if(control.is(':checked'))
    {
        $('#'+tab_id).attr('class', '');
        $('#'+tab_id+' a').attr('data-toggle', 'tab');
    }
    else
    {
        $('#'+tab_id).attr('class', 'disabled');
        $('#'+tab_id+' a').attr('data-toggle', '');
    }
}

function groupcontrol_change()
{
    var control = $(this);
    var group_id = control.data('groupcontrol');
    var group_ctrl = $('#'+group_id).parent('.panel');
    if(control.is(':checked'))
    {
        group_ctrl.show();
        group_ctrl.find('[data-was-required]').attr('required', 'true');
    }
    else
    {
        group_ctrl.hide();
        group_ctrl.find('[required]').removeAttr('required').attr('data-was-required', 1);
    }
}

function questcontrol_change()
{
    var control = $(this);
    var quest_id = control.data('questcontrol');
    var group_ctrl = $('#'+quest_id).parents('.form-group');
    if(control.is(':checked'))
    {
        group_ctrl.show();
        group_ctrl.find('[data-was-required]').attr('required', 'true');
    }
    else
    {
        group_ctrl.hide();
        group_ctrl.find('[required]').removeAttr('required').attr('data-was-required', 1);
    }
}

function add_val_to_field(obj, fieldname, val)
{
    if(fieldname.indexOf('[]') != -1)
    {
        if(obj[fieldname] === undefined)
        {
            obj[fieldname] = [];
        }
        obj[fieldname].push(val);
    }
    else
    {
        obj[fieldname] = val;
    }
}

function form_data_to_obj()
{
    var ret = {};
    var controls = $('.tab-content :input:not(.ignore)');
    for(i = 0; i < controls.length; i++)
    {
        var control = $(controls[i]);
        var name    = control.prop('name');
        if(name.indexOf('_') != -1)
        {
            var names = name.split('_');
            var obj = ret;
            for(j = 0; j < names.length - 1; j++)
            {
                if(obj[names[j]] === undefined)
                {
                    obj[names[j]] = {};
                }
                obj = obj[names[j]];
            }
            add_val_to_field(obj, names[j], control.val());
        }
        else
        {
            add_val_to_field(ret, name, control.val());
        }
    }
    return ret;
}

function wizard_init()
{
    _id = getParameterByName('_id');
    $('[title]').tooltip();
    $('input[data-tabcontrol]').change(tabcontrol_change);
    $('input[data-groupcontrol]').change(groupcontrol_change);
    $('input[data-questcontrol]').change(questcontrol_change);
    $('input[data-tabcontrol]').each(tabcontrol_change);
    $('input[data-groupcontrol]').each(groupcontrol_change);
     $('input[data-questcontrol]').each(questcontrol_change);
    $('.navbar-nav').click(show_tab);
    $('.previous a').click(prev_tab);
    $('.next a').click(next_tab);
    $('.previous').attr('class', 'previous disabled');
    $('a[data-toggle="tab"]').on('shown.bs.tab', tab_changed);
}

$(wizard_init);
