
$(document).ready(function(){
    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $userInfo = $("#userInfo");

    //切换到注册
    $loginBox.find('a').on('click',function(){
        $registerBox.show();
        $loginBox.hide();
    })
    //切换到登录
    $registerBox.find('a').on('click',function(){
        
        $loginBox.show();
        $registerBox.hide();
    })

    //注册
    $registerBox.find('button').on('click',function(){
        $.ajax({
            type:'post',
            url:'/api/user/register',
            data: {
                username:$registerBox.find('[name="username"]').val(),
                password:$registerBox.find('[name="password"]').val(),
                repassword:$registerBox.find('[name="repassword"]').val()
            },
            dataType:'json',
            success:function(data){
                $('#registerBox').find(".colWarn").html(data.msg);
            }
        });
    })

    //登录
    $loginBox.find('button').on('click',function(){
        $.ajax({
            type:'post',
            url:'/api/user/login',
            data:{
                username:$loginBox.find('[name="username"]').val(),
                password:$loginBox.find('[name="password"]').val()

            },
            dataType:'json',
            success:function(data){
                $loginBox.hide();
                // console.log(data.code);
                if(data.code){
                    // setTimeout(function(){
                    //     $loginBox.hide();
                    //     $userInfo.show();
                    //     console.log("success");
                    //     //显示用户的信息
                    //     $userInfo.find(".username").html(data.userInfo.username);
                    //     $userInfo.find(".info").html("你好，欢迎来到我的博客首页");
                    //     $('#registerBox').find(".colWarn").html(data.msg);
                    // },1000);
                    window.location.reload();
                }
            }
        })
    })
    //退出
    $('#logout').on('click',function(){
        $.ajax({
            url:'/api/user/logout',
            method:'get',
            success:function(data){
                if(!data.code){
                    window.location.reload();
                }
            }
        })
    })
});