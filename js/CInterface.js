function CInterface(){
    var _oScoreText;
    var _oButExit;
    var _oHitArea;
    var _oAudioToggle;
    var _oEndPanel;
    var _oNextLevelPanel;
    
    this._init = function(){
        
        _oScoreText = new createjs.Text(TEXT_SCORE +" 0","bold 38px Chewy", "#fff");
        _oScoreText.x = (CANVAS_WIDTH/2) - 30;
        _oScoreText.y = 10;
        _oScoreText.textAlign = "left";
        s_oStage.addChild(_oScoreText);
        
        var oParent = this;
	_oHitArea = new createjs.Bitmap(s_oSpriteLibrary.getSprite('hit_area'));
        s_oStage.addChild(_oHitArea);
	_oHitArea.on("pressup",function(evt){oParent._onTapScreen(evt.stageX,evt.stageY)}); 
        
        var oSprite = s_oSpriteLibrary.getSprite('but_pause');
        oSprite.scaleX = oSprite.scaleY = 0.5;
        _oButExit = new CGfxButton(CANVAS_WIDTH - (oSprite.width/2) - 10,(oSprite.height/2) + 10,oSprite,true);
        //_oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        var oSpriteMoreGames = s_oSpriteLibrary.getSprite('but_more_games');
        _ButMoreGames = new CGfxButton((oSpriteMoreGames.width/2) + 5,(oSpriteMoreGames.height/2) + 5,oSpriteMoreGames, true);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle = new CGfxButton(_oButExit.getX() - oSprite.width - 10,(oSprite.height/2) + 10,s_oSpriteLibrary.getSprite('setting_icon'), true);
            //_oAudioToggle = new CToggle(_oButExit.getX() - oSprite.width,(oSprite.height/2) + 10,s_oSpriteLibrary.getSprite('audio_icon'));
            //_oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
        
        _oNextLevelPanel = new CNextLevel();
        _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
    };
    
    this.unload = function(){
        _oButExit.unload();
        _oButExit = null;

        if(DISABLE_SOUND_MOBILE === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        s_oStage.removeAllChildren();
    };
    
    this._onTapScreen = function(iX,iY){
        s_oGame.onShot(iX,iY);
    };
    
    this.gameOver = function(iScore){
        _oEndPanel.show(iScore,false);
    };
    
    this.win = function(iScore){
        _oEndPanel.show(iScore,true);
    };
    
    this.nextLevel = function(iLevel,iScore){
        _oNextLevelPanel.show(iLevel,iScore);
    };
    
    this.refreshScore = function(iScore){
        _oScoreText.text = TEXT_SCORE +" "+iScore;
    };
    
    this._onExit = function(){
        s_oGame.onExit();  
    };
    
    this._onAudioToggle = function(){
        createjs.Sound.setMute(!s_bAudioActive);
    };

    s_oInterface = this;
    
    this._init();
    
    return this;
}

var s_oInterface;