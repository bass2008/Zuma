function CBall(iIndexColor,oContainer){
    var _iIndex;
    var _iCurFotogram;
    var _oSprite;
    var _oExplosion;
    var _oContainer;

    this._init = function(iIndexColor,oContainer){
        _iIndex = iIndexColor;
        _iCurFotogram = 0;
        _oContainer = oContainer;
        
        var oSprite = s_oSpriteLibrary.getSprite('ball_'+_iIndex);
        BALL_DIAMETER = oSprite.height / 2;
        BALL_DIAMETER_SQUARE = BALL_DIAMETER * BALL_DIAMETER;
        BALL_RADIUS = Math.round(BALL_DIAMETER/2);

        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: BALL_DIAMETER, height: BALL_DIAMETER, regX: BALL_RADIUS, regY: BALL_RADIUS}, 
                        animations: {move:[0,17]}
                    };
        
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        
        _oSprite = new createjs.Sprite(oSpriteSheet);
        _oSprite.stop();

        _oContainer.addChild(_oSprite);
        
        
    };
    
    this.unload = function(){
        _oContainer.removeChild(_oExplosion);
        _oContainer.removeChild(_oSprite);
    };
    
    this.nextFrame = function(){
        var iFrame;
        if(_oSprite.currentFrame + 1 === 18){
                iFrame = 0;
        }else{
                iFrame = _oSprite.currentFrame + 1;
        }
        _oSprite.gotoAndStop(iFrame);
    };
    
    this.prevFrame = function(){
        var iFrame;
        if(_oSprite.currentFrame-1 < 0){
                iFrame = 17;
        }else{
               iFrame = _oSprite.currentFrame - 1;
        }
        _oSprite.gotoAndStop(iFrame);
    };
    
    this.setPos = function(iIndex,aPos){
        if(iIndex > _iCurFotogram){
                this.nextFrame();
        }
        else if(iIndex < _iCurFotogram){
                this.prevFrame();
        }
        _iCurFotogram = iIndex;

        _oSprite.x = aPos[_iCurFotogram][0];
        _oSprite.y = aPos[_iCurFotogram][1];
        _oSprite.rotation = aPos[_iCurFotogram][2] - 90;
    };
    
    this.changePos = function(iX,iY){
        _oSprite.x =  iX;
        _oSprite.y =  iY;
    };
    
    this.increasePosWithNumbers = function(iXIncrease,iYIncrease){
        _oSprite.x += iXIncrease;
        _oSprite.y += iYIncrease;
    };
    
    this.decreasePos = function(iXIncrease,iYIncrease){
        _oSprite.x -= iXIncrease;
        _oSprite.y -= iYIncrease;
    };
    
    this.increasePos = function(iIncrease,aPos){
        var iIndex = _iCurFotogram + iIncrease;
        this.setPos(iIndex,aPos);
    };
    
    this.setContainer = function(oContainer){
        _oSprite.mask = null;
        _oContainer = oContainer;
    };
    
    this.explode = function(){
        var oSprite = s_oSpriteLibrary.getSprite('explosion');
        var oData2 = {   // image to use
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: 62, height: 62, regX: 31, regY: 31}, 
                        animations: {  show: [0, 19],hide:[20] }
                        
        };

        var oParent = this;
        var oSpriteSheetExplosion = new createjs.SpriteSheet(oData2,"show");
        _oExplosion = new createjs.Sprite(oSpriteSheetExplosion);
        _oExplosion.addEventListener("animationend",function(){oParent.onExplosionEnd();});
        _oContainer.addChild(_oExplosion);
        
        _oExplosion.x = _oSprite.x;
        _oExplosion.y = _oSprite.y;
        _oExplosion.gotoAndPlay("show");
        
        _oSprite.visible= false;
    };
    
    this.onExplosionEnd = function(){
       _oContainer.removeChild(_oExplosion);
       _oContainer.removeChild(_oSprite);
    };
    
    this.rollInStage = function(){
        
    };
    
    this.getFotogram = function(){
        return _iCurFotogram;
    };
    
    this.getSprite = function(){
        return _oSprite;
    };
    
    this.getIndex = function(){
        return _iIndex;
    };
    
    this.getX = function(){
        return _oSprite.x;
    };
    
    this.getY = function(){
        return _oSprite.y;
    };
    
    this._init(iIndexColor,oContainer);
}