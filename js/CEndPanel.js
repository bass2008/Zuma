function CEndPanel(oSpriteBg){
    
    var _oBg;
    var _oScoreTextBack;
    var _oScoreText;
    var _oMsgText;
    var _oMsgTextBack;
    var _oGroup;
    
    this._init = function(oSpriteBg){
        
        _oBg = new createjs.Bitmap(oSpriteBg);
        _oBg.x = 0;
        _oBg.y = 0;

        _oMsgTextBack = new createjs.Text("","bold 48px Chewy", "#000");
        _oMsgTextBack.x = CANVAS_WIDTH/2 +2;
        _oMsgTextBack.y = (CANVAS_HEIGHT/2)-138;
        _oMsgTextBack.textAlign = "center";

        _oMsgText = new createjs.Text("","bold 48px Chewy", "#ffffff");
        _oMsgText.x = CANVAS_WIDTH/2;
        _oMsgText.y = (CANVAS_HEIGHT/2)-140;
        _oMsgText.textAlign = "center";
        
        _oScoreTextBack = new createjs.Text("","bold 32px Chewy", "#000");
        _oScoreTextBack.x = CANVAS_WIDTH/2 +1;
        _oScoreTextBack.y = (CANVAS_HEIGHT/2)+11;
        _oScoreTextBack.textAlign = "center";
        
        _oScoreText = new createjs.Text("","bold 32px Chewy", "#ffffff");
        _oScoreText.x = CANVAS_WIDTH/2;
        _oScoreText.y = (CANVAS_HEIGHT/2)+10;
        _oScoreText.textAlign = "center";
        
        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible=false;
        
        _oGroup.addChild(_oBg, _oScoreTextBack,_oScoreText,_oMsgTextBack,_oMsgText);

        s_oStage.addChild(_oGroup);
    };
    
    this.unload = function(){
        _oGroup.off("mousedown",this._onExit);
        s_oStage.removeChild(_oGroup);
    };
    
    this._initListener = function(){
        _oGroup.on("mousedown",this._onExit);
    };
    
    this.show = function(iScore,bWin){
        if(bWin){
            _oMsgTextBack.text = TEXT_CONGRATS;
            _oMsgText.text = TEXT_CONGRATS;
        }else{
            _oMsgTextBack.text = TEXT_GAMEOVER;
            _oMsgText.text = TEXT_GAMEOVER;
        }
        _oScoreTextBack.text = TEXT_FINAL_SCORE+": "+iScore;
        _oScoreText.text = TEXT_FINAL_SCORE+": "+iScore;
        _oGroup.visible = true;
        
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {oParent._initListener();});
        
        $(s_oMain).trigger("save_score",iScore);
    };
    
    this._onExit = function(){
        _oGroup.off("mousedown");
        s_oGame.onExit();
    };
    
    this._init(oSpriteBg);
    
    return this;
}