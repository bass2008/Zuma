function CExtraScore(iX,iY,oContainer){
    
    var _oSprite;
    
    this._init = function(iX,iY,oContainer){
        var oSprite = s_oSpriteLibrary.getSprite('extra_score');
        _oSprite = new createjs.Bitmap(oSprite);
        _oSprite.x = iX;
        _oSprite.y = iY;
        _oSprite.regX = oSprite.width/2;
        _oSprite.regY = oSprite.height/2;
        _oSprite.alpha = 0;
        oContainer.addChild(_oSprite);
        
        createjs.Tween.get(_oSprite).to({alpha:1}, 1000).call(function(){oContainer.removeChild(_oSprite);});  
    };
    
    this._init(iX,iY,oContainer);
}