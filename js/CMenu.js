function CMenu(){
    var _oBg;
    var _oButPlay;
    var _oAudioToggle;
    var _ButMoreGames;
    var _oFade;
    
    this._init = function(){
        _oBg = new createjs.Bitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);
        var oSprite = s_oSpriteLibrary.getSprite('but_bg');
        _oButPlay = new CTextButton((CANVAS_WIDTH/2),CANVAS_HEIGHT -100,oSprite,TEXT_PLAY,"Chewy","#ffffff",40);
        _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);

        var oSpriteMoreGames = s_oSpriteLibrary.getSprite('but_more_games');
        _ButMoreGames = new CGfxButton((oSpriteMoreGames.width/2) + 5,(oSpriteMoreGames.height/2) + 5,oSpriteMoreGames, true);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('setting_icon');
            _oAudioToggle = new CGfxButton(CANVAS_WIDTH - (oSprite.width/2) - 10,(oSprite.height/2) + 10,oSprite, true);
            //_oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);

            s_oSoundtrack = createjs.Sound.play("soundtrack",{ loop:100});
        }

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 1000).call(function(){_oFade.visible = false;});  
    };
    
    this.unload = function(){
        _oButPlay.unload(); 
        _oButPlay = null;
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        s_oStage.removeChild(_oBg);
        _oBg = null;
        
        s_oStage.removeChild(_oFade);
        _oFade = null;
    };
    
    this._onButPlayRelease = function(){
        this.unload();
        s_oMain.gotoGame();
    };

    this._onAudioToggle = function(){
        createjs.Sound.setMute(!s_bAudioActive);
    };
    
    this._init();
}