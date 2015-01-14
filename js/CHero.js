function CHero(){
    var _bCanShoot = false;
    var _iWidth;
    var _iHeight;
    var _iBallColors;
    var _aColorsAvailable;
    var _oCurBall;
    var _oNextBall;
    var _oSpriteBg;
    var _oMaskCurBall;
    var _oMaskNextBall;
    var _oContainer;
    var _oContainerBack;
    
    this._init = function() {
        //init back 'heroBack'
        var oSpriteBack = s_oSpriteLibrary.getSprite('heroBack');
        _oContainerBack = new createjs.Container();
        _oContainerBack.regX = oSpriteBack.width/2;
        _oContainerBack.regY = oSpriteBack.height/2;
        s_oStage.addChild(_oContainerBack);

        var oSpriteBackBitmap = new createjs.Bitmap(oSpriteBack);
        oSpriteBackBitmap.x = 0;
        oSpriteBackBitmap.y = 0;
        _oContainerBack.addChild(oSpriteBackBitmap);

        //init container
        var oSprite = s_oSpriteLibrary.getSprite('hero');
        _oContainer = new createjs.Container();
        _oContainer.regX = oSprite.width/2;
        _oContainer.regY = oSprite.height/2;
        s_oStage.addChild(_oContainer);

        _oSpriteBg = new createjs.Bitmap(oSprite);
        _oSpriteBg.x = 0;
        _oSpriteBg.y = 0;
        _oContainer.addChild(_oSpriteBg);
        
        _oMaskCurBall = new createjs.Shape();
        _oMaskCurBall.graphics.beginFill("rgba(255,0,0,0.01)").drawCircle(40, 110, 16);
        _oContainer.addChild(_oMaskCurBall);

        _oMaskNextBall = new createjs.Shape();
        _oMaskNextBall.graphics.beginFill("rgba(255,0,0,0.01)").drawCircle(120, 60, 6);
        _oContainer.addChild(_oMaskNextBall);

        _iWidth = oSprite.width;
        _iHeight = oSprite.height;
    };
    
    this.reset = function(oPos,iBallColors){
        _iBallColors = iBallColors;
        if(_oCurBall !== undefined && _oCurBall !== null){
            _oCurBall.unload();
        }
        
        if(_oNextBall !== undefined && _oNextBall !== null){
            _oNextBall.unload();
        }

        _oContainer.x = oPos.x;
        _oContainer.y = oPos.y;

        _oContainerBack.x = oPos.x;
        _oContainerBack.y = oPos.y;

        _aColorsAvailable = new Array();
        for(var i=0;i<_iBallColors;i++){
            _aColorsAvailable[i] = true;
        }
    };
    
    this.unload = function(){
        
    };
    
    this.rotate = function(iRot){
        _oContainer.rotation = iRot;
    };
    
    this.start = function(){
        _oCurBall = this._getRandomBall();
        _oCurBall.changePos(_iWidth/2 - 25, (_iHeight/2) + 20);
        _oCurBall.getSprite().mask = _oMaskCurBall;
        
        _oNextBall = this._getRandomBall();
        _oNextBall.changePos(120,(_iHeight/2) - 12);
        _oNextBall.getSprite().mask = _oMaskNextBall;

        var oParent = this;
        createjs.Tween.get(_oCurBall.getSprite()).to({y:_oCurBall.getY()+25}, 300).call(function(){oParent._onBallReady()}); 
        createjs.Tween.get(_oNextBall.getSprite()).to({y:_oNextBall.getY()+16}, 300); 
    };
    
    this._getRandomBall = function(){
        var oBall;
        
        if(this._checkIfAllColorsNotAvailable() === true){
            return null;
        }
        
        do{
            var iRandomNum = Math.floor(Math.random() * _iBallColors);
            var bFound = false;

            if(_aColorsAvailable[iRandomNum] === true) {
                oBall = new CBall(iRandomNum,_oContainer);
                
                bFound = true;
                break;
            }
        }while(bFound === false);
        
        return oBall;
    };
    
    this._checkIfAllColorsNotAvailable = function(){
        var bRet = true;
        for(var i=0;i<_aColorsAvailable.length;i++){
            if(_aColorsAvailable[i] === true){
                bRet = false;
            }
        }
        
        return bRet;
    };
    
    this._nextShoot = function(){
        if(_oCurBall !== null){
            _oCurBall.unload();
        }

        _oCurBall = _oNextBall;
        _oCurBall.changePos(_iWidth/2 - 25,(_iHeight/2) + 20 );
        _oCurBall.getSprite().mask = _oMaskCurBall;

        _oNextBall = this._getRandomBall();
        _oNextBall.changePos(120,(_iHeight/2) - 12);
        _oNextBall.getSprite().mask = _oMaskNextBall;
        
        var oParent = this;
        createjs.Tween.get(_oCurBall.getSprite()).to({y:_oCurBall.getY()+25}, 300).call(function(){oParent._onBallReady()}); 
        createjs.Tween.get(_oNextBall.getSprite()).to({y:_oNextBall.getY()+16}, 300); 
    };
    
    this.colorCleared = function(iColor){
        _aColorsAvailable[iColor] = false;

        if(_oCurBall.getIndex() === iColor){
                _oCurBall.unload();
                _oCurBall = this._getRandomBall();
                if(_oCurBall !== null){
                    _oCurBall.changePos(_iWidth/2 -25 ,(_iHeight/2)+45 );
                    _oCurBall.getSprite().mask = _oMaskCurBall;
                }
        }
        
        if(_oNextBall.getIndex() === iColor){
                _oNextBall.unload();
                _oNextBall = this._getRandomBall();
                if(_oNextBall !== null){
                    _oNextBall.changePos(120,(_iHeight/2) +4 );
                    _oNextBall.getSprite().mask = _oMaskNextBall;
                }
        }
       
    };
    
    
    this._onBallReady = function(){
        _bCanShoot = true;
    };
    
    this.getCurrentBall = function(){
        _bCanShoot = false;
        var oBall = _oCurBall;
        this._nextShoot();
        return oBall;
    };
    
    this.getX = function(){
        return _oContainer.x;
    };
    
    this.getY = function(){
        return _oContainer.y;
    };
    
    this.getRotation = function(){
        return _oContainer.rotation;
    };
    
    this.canShoot = function(){
        return _bCanShoot;
    };
    
    this._init();
}