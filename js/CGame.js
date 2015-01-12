function CGame(oData){
    var _bUpdate = false;
    var _bCanShoot;
    var _bCheckPushCollision;
    var _bAttractBall;
    var _iCurLevel = 1;
    var _iMultiplierCombo;
    var _iTotalBall;
    var _iBallSpeed;
    var _iScore;
    var _iGameState = -1;
    var _iCurCombos;
    var _iMaxCombos;
    var _iIntervalID;
    var _iLastId;
    var _iBallColors;
    var _iTimeElaps;
    var _aBalls;
    var _aCurveMapData;
    var _aBallShooted;
    var _aBallCrushed;
    var _aBallAttracted = null;
    
    var _oCurve = null;
    var _oEndSprite = null;
    var _oHero;
    var _oBg;
    var _oInterface;
    var _oBallAttach;
    var _oCurveAttach;
    var _oExtraScoreAttach;
    var _oBgAttach;
    var _SetPosIndex;

    this._init = function(){

        _SetPosIndex = 16; // 24
        s_oBezier = new CBezier();
        
	_oBgAttach = new createjs.Container();
        _oBg = new createjs.Bitmap(s_oSpriteLibrary.getSprite('bg_game_'+_iCurLevel));
        _oBgAttach.addChild(_oBg);
	s_oStage.addChild(_oBgAttach);
		
        _oHero = new CHero();
        
        _iScore = 0;
        
		
        _oCurveAttach = new createjs.Container();
        _oBallAttach = new createjs.Container();
        _oExtraScoreAttach = new createjs.Container();
		
        this.reset();
		
        s_oStage.addChild(_oCurveAttach);
        s_oStage.addChild(_oBallAttach);
	s_oStage.addChild(_oExtraScoreAttach);

        _oInterface = new CInterface();
        
        if(s_bMobile === false){
            var oParent = this;
            s_oStage.addEventListener("stagemousemove", function(evt){oParent._onMouseMove(evt.stageX,evt.stageY)});
        }
        
        _bUpdate = true;
    };
    
    this.unload = function(){
        _bUpdate = false;
        clearInterval(_iIntervalID);
        createjs.Sound.stop();

        _oInterface.unload();
        _oHero.unload();
        s_oStage.removeAllChildren();
    };
    
    this.reset = function(){
        _bCanShoot = true;
        _bCheckPushCollision = false;
        _bAttractBall = false;
    
        _iBallSpeed = s_oLevelSettings.getBallSpeedForLevel(_iCurLevel);
        _iTotalBall = s_oLevelSettings.getBallNumberForLevel(_iCurLevel );
        _iBallColors = s_oLevelSettings.getBallColorsForLevel(_iCurLevel);
        BALL_ROLLING_IN = Math.floor(_iTotalBall * 0.33);
        
        _iCurCombos = 0;
        _iMaxCombos = 1;
        _iMultiplierCombo = 1;
        _iTimeElaps = 0;

        _oHero.reset(s_oLevelSettings.getHeroPosForLevel(_iCurLevel),_iBallColors);
        if(_oCurve !== null){
            _oCurveAttach.removeChild(_oCurve);
            _oCurveAttach.removeChild(_oEndSprite);
        }
        this._initCurve();
        this._initBall();
    };
	
    this._normalize = function(v){
            var len = this._length(v);
            if (len > 0 ){
                    return { x : (v.x/len), y : (v.y/len) }; 
            }
            return v;
    };

    this._length = function(v){
            return Math.sqrt( v.x*v.x+v.y*v.y );
    };

    this._dotProductV2 = function(v1,v2){
            return ( v1.x*v2.x+ v1.y*v2.y );
    };

    this._angleBetweenVectors = function( v1, v2 ){
            var iAngle = Math.acos( this._dotProductV2( v1, v2 ) / (  this._length(v1) * this._length(v2)) );
            if ( isNaN( iAngle ) === true ){
                    return 0;
            }else{
                    return iAngle;
            }
    };		

    this._rot90CW = function(v){
            return { x: v.y, y : -v.x};
    };
    this._rot90CCW = function(v){
            return { x: -v.y, y : v.x};
    };	

    this._rotateVector2D = function( iAngle, v ) {		
                    var iX = v.x *   Math.cos( iAngle )  + v.y * Math.sin( iAngle );
                    var iY = v.x * (-Math.sin( iAngle )) + v.y * Math.cos( iAngle );		
                    return { x:iX, y:iY };
    };
	
    this._initCurve = function(){
        var _aCurve = s_oLevelSettings.getCurveForLevel(_iCurLevel);
        
        var oCurveGfx = new createjs.Graphics();
        oCurveGfx.setStrokeStyle(2);
        oCurveGfx.beginStroke("#fff");
        oCurveGfx.moveTo(_aCurve[0][0],_aCurve[0][1]);
        for(var i = 1;i<_aCurve.length - 2;++i){
            var iX = (_aCurve[i][0] + _aCurve[i+1][0])/2;
            var iY = (_aCurve[i][1] + _aCurve[i+1][1])/2;
            oCurveGfx.quadraticCurveTo(_aCurve[i][0],_aCurve[i][1],iX,iY);
        }
        
        oCurveGfx.quadraticCurveTo(_aCurve[i][0],_aCurve[i][1],_aCurve[i+1][0],_aCurve[i+1][1]);
	_aCurveMapData = new Array();
        

		for(var j = 0;j<_aCurve.length - 2;++j){
                var oPoint0 = (j === 0)?new createjs.Point(_aCurve[0][0],_aCurve[0][1]):new createjs.Point((_aCurve[j][0]+_aCurve[j+1][0])/2,
                                                                                            (_aCurve[j][1]+_aCurve[j+1][1])/2);
                var oPoint1 = new createjs.Point(_aCurve[j+1][0],_aCurve[j+1][1]);
                var oPoint2 = (j <= _aCurve.length - 4)?new createjs.Point((_aCurve[j+1][0] + _aCurve[j+2][0])/2,
                                                 (_aCurve[j+1][1] + _aCurve[j+2][1])/2):new createjs.Point(_aCurve[j+2][0],_aCurve[j+2][1]);
                var steps = s_oBezier.init(oPoint0, oPoint1, oPoint2, STEP_LENGTH);
                for(var m = 1;m<=steps;++m){
                    var data = s_oBezier.getAnchorPoint(m);
                    _aCurveMapData.push(data);
                }
        }
		
        var iStrength = 16;
        var oPoint;
        var h;
        var oFirstPoint;

        oCurveGfx.setStrokeStyle(4);
        oCurveGfx.beginStroke("#00a29b");
        oCurveGfx.beginFill("#221910");

        // DRAW LEFT CURVE
        oPoint = { x : (_aCurveMapData[1][0] - _aCurveMapData[0][0]), y : (_aCurveMapData[1][1] - _aCurveMapData[0][1])  };
        oPoint = this._normalize(oPoint);
        oPoint = this._rot90CW(oPoint);

        oPoint.x *= iStrength;
        oPoint.y *= iStrength;
        oPoint.x += _aCurveMapData[0][0];
        oPoint.y += _aCurveMapData[0][1];

        oFirstPoint = { x:oPoint.x, y:oPoint.y};

        oCurveGfx.moveTo(oPoint.x,oPoint.y);
        for ( h = 1; h <_aCurveMapData.length-1; h++){

                oPoint = { x : (_aCurveMapData[h+1][0] - _aCurveMapData[h][0]), y : (_aCurveMapData[h+1][1] - _aCurveMapData[h][1])  };
                oPoint = this._normalize(oPoint);
                oPoint = this._rot90CW(oPoint);

                oPoint.x *= iStrength;
                oPoint.y *= iStrength;
                oPoint.x += _aCurveMapData[h][0];
                oPoint.y += _aCurveMapData[h][1];			
                oCurveGfx.lineTo(oPoint.x,oPoint.y);
        }

        oCurveGfx.lineTo(oPoint.x,oPoint.y);

        // DRAW RIGHT CURVE
        oPoint = { x : (_aCurveMapData[_aCurveMapData.length-1][0] - _aCurveMapData[_aCurveMapData.length-2][0]),
                           y : (_aCurveMapData[_aCurveMapData.length-1][1] - _aCurveMapData[_aCurveMapData.length-2][1])  };

        oPoint = this._normalize(oPoint);
        oPoint = this._rot90CCW(oPoint);

        oPoint.x *= iStrength;
        oPoint.y *= iStrength;
        oPoint.x += _aCurveMapData[_aCurveMapData.length-1][0];
        oPoint.y += _aCurveMapData[_aCurveMapData.length-1][1];
        oCurveGfx.lineTo(oPoint.x,oPoint.y);

        for ( h = _aCurveMapData.length-2; h > 1; h--){
                oPoint = { x : (_aCurveMapData[h][0] - _aCurveMapData[h-1][0]), y : (_aCurveMapData[h][1] - _aCurveMapData[h-1][1])  };
                oPoint = this._normalize(oPoint);
                oPoint = this._rot90CCW(oPoint);

                oPoint.x *= iStrength;
                oPoint.y *= iStrength;
                oPoint.x += _aCurveMapData[h][0];
                oPoint.y += _aCurveMapData[h][1];			
                oCurveGfx.lineTo(oPoint.x,oPoint.y);
        }		

        oCurveGfx.lineTo(oFirstPoint.x, oFirstPoint.y);

        oCurveGfx.endFill();

        _oCurve = new createjs.Shape(oCurveGfx);
        _oCurveAttach.addChild(_oCurve);
        
        var iLen = _aCurveMapData.length;
        var oSprite = s_oSpriteLibrary.getSprite('end_path');
        _oEndSprite = new createjs.Bitmap(oSprite);
        _oEndSprite.x = _aCurveMapData[iLen - 9][0];
        _oEndSprite.y = _aCurveMapData[iLen - 9][1];
        _oEndSprite.regX = oSprite.width/2;
        _oEndSprite.regY = oSprite.height/2;
        _oCurveAttach.addChild(_oEndSprite);
    };
    
    this._initBall = function(){
        _aBalls = new Array( );
        var oBall = this.getRandomBall();
        _aBalls.unshift(oBall);

        oBall.setPos(_SetPosIndex,_aCurveMapData);
       _iGameState = STATE_GAME_ROLL_IN;
    };
    
    this.getRandomBall = function(){
        _iTotalBall--;
        var iRandomNum = Math.floor(Math.random() * _iBallColors);
        return new CBall(iRandomNum,_oBallAttach);
    };

    this._pushNextBall = function(index,step){
        console.log(index + " :" + step);
        var aTemp = new Array();
        aTemp.push(_aBalls[index]);

        for(var i = index;i < _aBalls.length - 1;++i){
            if( (_aBalls[i + 1].getFotogram() - _aBalls[i].getFotogram()) <= 24){
                if( (_aBalls[i + 1].getFotogram() - _aBalls[i].getFotogram() ) < 24){
                        _aBalls[i + 1].setPos(_aBalls[i].getFotogram() + 24,_aCurveMapData);
                    //console.log("if push next");
                }
                aTemp.push(_aBalls[i + 1]);
                //console.log("else");
            }else{
                break;
            }
        }

        for(var j = 0;j < aTemp.length;++j){
                aTemp[j].increasePos(step,_aCurveMapData);
        }

        if(_aBalls[_aBalls.length - 1].getFotogram() >= (_aCurveMapData.length - 17) ){
                _bCanShoot = false;

                if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                        s_oSoundtrack.pause();
                        var oSound = createjs.Sound.play("game_over");
                        oSound.addEventListener("complete", this._onSoundGameOverComplete);
                }

                s_oStage.removeEventListener("stagemousemove");
                _bCheckPushCollision = false;
                _bAttractBall = false;
                _iMultiplierCombo = 1;
                
                _aBalls[_aBalls.length - 1].unload();
               
                _aBalls.splice(_aBalls.length-1,1);
                _iGameState = STATE_GAME_ROLL_OUT;
        }
    };
    
    this.onIntroduceBall = function(){
        if(_aBalls.length !== 0){
            s_oGame._pushNextBall(0,1);

            if(_aBalls[0].getFotogram() === 32 && _iTotalBall !== 0){
                var oBall = s_oGame.getRandomBall();
                _aBalls.unshift(oBall);
                
                oBall.setPos(_SetPosIndex,_aCurveMapData);
            }
        }
    };
    
    this.shoot = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                createjs.Sound.play("shot");
        }
        
        var iRadian = (_oHero.getRotation() + 90) * Math.PI/180;
        var oBall = _oHero.getCurrentBall();
        oBall.changePos(_oHero.getX() + 60 * Math.cos(iRadian),_oHero.getY() + 60 * Math.sin(iRadian) );
        _oBallAttach.addChild(oBall.getSprite());
        oBall.setContainer(_oBallAttach);
        _aBallShooted.push(new Array(oBall,iRadian));

        _iGameState = STATE_GAME_SHOOTING;
    };
    
    this._checkCollision = function(aArrayToCheck){
        var oBall = aArrayToCheck[0];

        for(var j = 0;j<_aBalls.length;++j){
            var iDist = (_aBalls[j].getX() - oBall.getX())*(_aBalls[j].getX() - oBall.getX()) + 
                                                (_aBalls[j].getY() - oBall.getY())*(_aBalls[j].getY() - oBall.getY());
            if(iDist <= BALL_DIAMETER_SQUARE){
                return j;
            }
        }
        return -1;
    };
    
    this._insertBall = function(oBall,iIndex,szLabel){
        var iPosX;
        var iPosY;
        var iInsertPos;

        if(szLabel === "next"){
            iInsertPos = _aBalls[iIndex].getFotogram() + 16;

            if(_aBalls[iIndex + 1] && (_aBalls[iIndex + 1].getFotogram() - _aBalls[iIndex].getFotogram()) < 32 ){
                _aBallCrushed.push(new Array(oBall,_aBalls[iIndex + 1]));
                _bCheckPushCollision = true; 
            }
        }else{
            if(_aBalls[iIndex - 1] && (_aBalls[iIndex].getFotogram() - _aBalls[iIndex - 1].getFotogram()) < 32){
                iInsertPos = _aBalls[iIndex - 1].getFotogram() + 16; 
                _aBallCrushed.push(new Array(oBall,_aBalls[iIndex]));
                _bCheckPushCollision = true; 
            }else {
                iInsertPos = _aBalls[iIndex].getFotogram() - 16;
            }
        }
        iPosX = _aCurveMapData[iInsertPos][0];
        iPosY = _aCurveMapData[iInsertPos][1];

        var oParent = this;
        createjs.Tween.get(oBall.getSprite()).to({x:iPosX,y:iPosY}, 200).call(function(){oParent.motionFinished(oBall,iInsertPos)});   
    };
    
    this.motionFinished = function(oBall,iInsertPos){
        var iIndex;

        for(var i = 0;i < _aBalls.length;++i){
            if(_aBalls[i].getFotogram() > iInsertPos){
                iIndex = i;
                break;
            }
            if(i === _aBalls.length - 1){
                iIndex = i + 1;
            }
        }

        _aBallCrushed.splice(_aBallCrushed.indexOf(oBall),1);

        oBall.setPos(iInsertPos,_aCurveMapData);
        _aBalls.splice(iIndex,0,oBall);

        if(_aBalls[iIndex - 1] && _aBalls[iIndex - 1].getIndex() === _aBalls[iIndex].getIndex() &&
                                                    (_aBalls[iIndex].getFotogram() - _aBalls[iIndex - 1].getFotogram()) > 17){
                                                
            this._addToBallAttracted(_aBalls[iIndex]);
        }
        if(_aBalls[iIndex + 1] && _aBalls[iIndex + 1].getIndex() === _aBalls[iIndex].getIndex() 
                                    && (_aBalls[iIndex + 1].getFotogram() - _aBalls[iIndex].getFotogram()) > 17){
                this._addToBallAttracted(_aBalls[iIndex + 1]);
        }

        this._clearCheck(iIndex,true);
    };
    
    this._addToBallAttracted = function(oBall){
        if(_aBallAttracted === null){
            _aBallAttracted = new Array();
            _aBallAttracted.push(oBall);
        }else{
            _aBallAttracted.push(oBall);
        }
        setTimeout(function(){_bAttractBall = true;},400);
    };
    
    this._clearCheck = function(iIndex,bClear){
        var aTemp = new Array();
        aTemp.push(_aBalls[iIndex]);
        var iColorIndex = _aBalls[iIndex].getIndex();

        var i = iIndex + 1;
        while(_aBalls[i]){

            if(_aBalls[i].getIndex() === iColorIndex){
                
                if(_aBalls[i].getFotogram() - _aBalls[i - 1].getFotogram() <= 17){
                    aTemp.push(_aBalls[i]);
                    ++i;
                }else if(!bClear){
                    aTemp.push(_aBalls[i]);
                    ++i;
                } else break;
            }else{
                break;
            }
        }
      
        var j = iIndex - 1;
        while(_aBalls[j]){
            if(_aBalls[j].getIndex() === iColorIndex){
                    if(_aBalls[j + 1].getFotogram() - _aBalls[j].getFotogram() <=17){
                        aTemp.push(_aBalls[j]);
                        --j;
                    }else if(!bClear){
                        aTemp.push(_aBalls[j]);
                        --j;
                    }
                    else break;
            } else{
                break;
            }
        }

        ++j;

        if(aTemp.length > 2 && bClear){
            this._clearBall(j,aTemp);
        }
        return aTemp.length;
    };
    
    this._attract = function(){
        if(_aBallAttracted.length !== 0){
            for(var i = 0;i<_aBallAttracted.length;++i){
                var iIndex = _aBalls.indexOf(_aBallAttracted[i]);
                if(iIndex !== -1 && _aBalls[iIndex - 1]){
                    if(_aBallAttracted[i].getIndex() === _aBalls[iIndex - 1].getIndex() ){
                        var iSteps = (_aBallAttracted[i].getFotogram()-_aBalls[iIndex - 1].getFotogram()) > 19?3:(_aBallAttracted[i].getFotogram()
                                                                    - _aBalls[iIndex - 1].getFotogram() - 16);
                        this._pushNextBall(iIndex,-iSteps);

                        if( (_aBallAttracted[i].getFotogram() - _aBalls[iIndex - 1].getFotogram() )<= 16){
                                _iMultiplierCombo++;
                                _aBallAttracted.splice(i,1);

                                
                                this._clearCheck(iIndex-1,true);
                                if(_aBallAttracted.length === 0){
                                    _bAttractBall = false;
                                    _iMultiplierCombo = 1;
                                }
                        }
                    }else{
                        _aBallAttracted.splice(i,1);
                        if(_iCurCombos > _iMaxCombos){
                                _iMaxCombos = _iCurCombos;
                        }
                        _iCurCombos = 0;
                    }
                }
            }
        }else{
            _bAttractBall = false;
            _iMultiplierCombo = 1;
        }
    };
    
    this._checkPushCollision = function(){
        if(_aBallCrushed.length !== 0){
            for(var i = 0; i < _aBallCrushed.length; ++i){
		var iDis = (_aBallCrushed[i][0].getX() - _aBallCrushed[i][1].getX())*
                                        (_aBallCrushed[i][0].getX() - _aBallCrushed[i][1].getX()) + 
                                        (_aBallCrushed[i][0].getY() - _aBallCrushed[i][1].getY())*
                                        (_aBallCrushed[i][0].getY() - _aBallCrushed[i][1].getY());
		var isCollision = iDis < BALL_DIAMETER_SQUARE?true:false;
		var iMoveStep = 0;
		while(isCollision){
                    ++iMoveStep;
                    iDis = (_aBallCrushed[i][0].getX() - _aCurveMapData[_aBallCrushed[i][1].getFotogram() + 
                                    iMoveStep][0])*(_aBallCrushed[i][0].getX() - _aCurveMapData[_aBallCrushed[i][1].getFotogram() + 
                                    iMoveStep][0])+(_aBallCrushed[i][0].getY() - _aCurveMapData[_aBallCrushed[i][1].getFotogram() + iMoveStep][1])
                                    *(_aBallCrushed[i][0].getY() - _aCurveMapData[_aBallCrushed[i][1].getFotogram() + iMoveStep][1]);
                    isCollision = iDis < BALL_DIAMETER_SQUARE?true:false;
                }

                var iIndex;
                iIndex = _aBalls.indexOf(_aBallCrushed[i][1]);
                if(iIndex !== -1){
                    this._pushNextBall(iIndex,iMoveStep);
                }
            }
        }else{
            _bCheckPushCollision = false;
        }
    };
    
    this._clearBall = function(iIndex,aTmpArray){
        ++_iCurCombos;

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            createjs.Sound.play("combo");
        }
        
        var iTmpScore = 0;
        for(var i = 0; i < aTmpArray.length; ++i){
            aTmpArray[i].explode();
            iTmpScore += COMBO_VALUE;
        }
        iTmpScore *= _iMultiplierCombo;
        _iScore += iTmpScore;

        _oInterface.refreshScore(_iScore );

        if(_aBalls.length === aTmpArray.length){
            _bCanShoot = false;
            _iLastId = _aBalls[_aBalls.length - 1].getFotogram();
            setTimeout(this._gamePass,600);
            
            if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                s_oSoundtrack.pause();
                var oSound = createjs.Sound.play("win");
                oSound.addEventListener("complete", this._onSoundGameOverComplete);
            }
        }
        _aBalls.splice(iIndex,aTmpArray.length);

        if(_iTotalBall === 0){
            this._checkColor(aTmpArray[0].getIndex() );
        }

        if(_aBalls[iIndex-1] && _aBalls[iIndex] && (_aBalls[iIndex - 1].getIndex() === _aBalls[iIndex].getIndex())){
            if(this._clearCheck(iIndex,false) < 3){
                if(_iCurCombos > _iMaxCombos){
                        _iMaxCombos = _iCurCombos;
                }
                _iCurCombos = 0;
            }

            this._addToBallAttracted(_aBalls[iIndex]);
        } else{
            if(_iCurCombos > _iMaxCombos){
                    _iMaxCombos = _iCurCombos;
            }
            _iCurCombos = 0;
        }
    };
    
    this._gamePass = function(){
        _iIntervalID = setInterval(s_oGame._extraScore,_iBallSpeed);
    };
    
    this._extraScore = function(){
        if( (_iLastId + 16) < (_aCurveMapData.length - 17) ){
            _iLastId += 16;
            new CExtraScore(_aCurveMapData[_iLastId][0],_aCurveMapData[_iLastId][1],_oExtraScoreAttach);
            _iScore += EXTRA_SCORE;
            _oInterface.refreshScore(_iScore);
        }else{
            clearInterval(_iIntervalID);
            s_oStage.removeEventListener("stagemousemove");
            _bCanShoot = false;
            
            _iCurLevel++;
            if(_iCurLevel > s_oLevelSettings.getNumLevels()){
                _oInterface.win(_iScore);
            }else{
                _oInterface.nextLevel(_iCurLevel,_iScore);
            }
            
        }
    };
    
    this._checkColor = function(iColor){
        for(var i = 0;i<_aBalls.length;++i){
                if(_aBalls[i].getIndex() === iColor) return;
        }

        for(var j = 0;j < _aBallShooted.length;++j){
                if(_aBallShooted[j].getIndex() === iColor) return;
        }
        _oHero.colorCleared(iColor);
    };
    
    this.nextLevel = function(){
		_oBgAttach.removeChild(_oBg);
		_oBg = new createjs.Bitmap(s_oSpriteLibrary.getSprite('bg_game_'+_iCurLevel));
        _oBgAttach.addChild(_oBg);
		
        this.reset();
        _bUpdate = true;
    };
    
    this.onShot = function(iX,iY){
        if(_bCanShoot && _oHero.canShoot() ){
            if(s_bMobile){
                 var iDx = iX - _oHero.getX();
                 var iDy = iY - _oHero.getY();
                 var iRadians = Math.atan2(iDy,iDx);
                 _oHero.rotate(iRadians * 180 / Math.PI - 90);
            }
            this.shoot();
        }
    };
    
    this._onMouseMove = function(iXMouse,iYMouse){
        var dx = iXMouse - _oHero.getX();
        var dy = iYMouse - _oHero.getY();
        var iRadians = Math.atan2(dy,dx);
        _oHero.rotate(iRadians * 180 / Math.PI - 90);
    };
    
    this.onExit = function(){
        createjs.Sound.stop();
        
        this.unload();
        s_oMain.gotoMenu();
        $(s_oMain).trigger("restart");
    };
    
    this._onSoundGameOverComplete = function(){
        s_oSoundtrack.resume();
    };
    
    this._updateMove = function(){
        _iTimeElaps += s_iTimeElaps;
        if(_iTimeElaps > _iBallSpeed){
            _iTimeElaps = 0;
            this.onIntroduceBall();
        }
    };
    
    this._updateRollOut = function(){
        for(var i = _aBalls.length-1;i>=0;--i){
            if(_aBalls[i].getFotogram() > (_aCurveMapData.length - 17)){
                _aBalls[i].unload();
                _aBalls.splice(i,1);
                if(_aBalls.length === 0){
                    _iGameState = -1;
                     _oInterface.gameOver(_iScore);
                }
            }else{
                _aBalls[i].increasePos(8,_aCurveMapData);
            }
        }
    };
    
    this._updateRollIn = function(){
        if(_aBalls.length < BALL_ROLLING_IN){
            for(var i = 0;i < _aBalls.length;++i){
                _aBalls[i].increasePos(4,_aCurveMapData);
            }

            if(_aBalls[0].getFotogram() === 32){
                var oBall = this.getRandomBall();
                _aBalls.unshift(oBall);
                oBall.setPos(_SetPosIndex,_aCurveMapData);
            }
        }else{
            _iGameState = -1;

            _aBallShooted = new Array();
            _aBallCrushed = new Array();
            _oHero.start();
            
            _iGameState = STATE_GAME_BALL_MOVE;
        }
    };
    
    this._updateShooting = function(){
        if(_aBallShooted.length !== 0){
            for(var i = 0;i<_aBallShooted.length;++i){
                if(_aBallShooted[i][0].getX() > 0 && _aBallShooted[i][0].getX() < CANVAS_WIDTH && 
                                                    _aBallShooted[i][0].getY() > 0 && _aBallShooted[i][0].getY() < CANVAS_HEIGHT){
                                                
                    //CHECK COLLISION
                    var iFlag = this._checkCollision(_aBallShooted[i]);
                    if(iFlag === -1){
                        _aBallShooted[i][0].increasePosWithNumbers(Math.cos(_aBallShooted[i][1]) * BALL_SHOOTED_SPEED,
                                                                Math.sin(_aBallShooted[i][1]) * BALL_SHOOTED_SPEED);
                        
                    }else{
                        var oBall = _aBallShooted[i][0];
                        var iRadians = _aBallShooted[i][1];
                        
                        var iDis = Math.sqrt((_aBalls[iFlag].getX() - oBall.getX())*(_aBalls[iFlag].getX() - oBall.getX()) + 
                                                                  (_aBalls[iFlag].getY() - oBall.getY() )*(_aBalls[iFlag].getY() - oBall.getY()) );
                        _aBallShooted[i][0].decreasePos( (BALL_DIAMETER - iDis) * Math.cos(iRadians),(BALL_DIAMETER - iDis) * Math.sin(iRadians) );

                        var iPrevX = _aCurveMapData[_aBalls[iFlag].getFotogram() - BALL_RADIUS][0];
                        var iPrevY = _aCurveMapData[_aBalls[iFlag].getFotogram() - BALL_RADIUS][1];
                        var iPrevDis = Math.sqrt((oBall.getX() - iPrevX)*(oBall.getX() - iPrevX)+(oBall.getY() - iPrevY)*(oBall.getY() - iPrevY));
                        var iNextX = _aCurveMapData[_aBalls[iFlag].getFotogram() + BALL_RADIUS][0];
                        var iNextY = _aCurveMapData[_aBalls[iFlag].getFotogram() + BALL_RADIUS][1];
                        var iNextDis = Math.sqrt((oBall.getX() - iNextX)*(oBall.getX() - iNextX)+(oBall.getY() - iNextY)*(oBall.getY() - iNextY));


                        var szLabel = iPrevDis > iNextDis ? "next" : "previous";
                        this._insertBall(_aBallShooted[i][0],iFlag,szLabel);
                        _aBallShooted.splice(i,1);
                    }
                } else{

                    _aBallShooted[i][0].unload();
                    _aBallShooted.splice(i,1);
                }
            }
        }
        else{
            _iGameState = -1;
        }
    };
    
    this.update = function(){
        if(_bUpdate === false){
            return;
        }


        if(_bAttractBall === true){
            this._attract();
        }

        if(_bCheckPushCollision === true){
            this._checkPushCollision();
        }

        switch(_iGameState){
            case STATE_GAME_ROLL_IN:{
                    this._updateRollIn();
                    break;
            }
            case STATE_GAME_ROLL_OUT:{
                    this._updateRollOut();
                    break;
            }
            case STATE_GAME_SHOOTING:{
                    this._updateShooting();
                    this._updateMove();
                    break;
            }
            default:{
                   this._updateMove(); 
            }
        }
        
	
    };
    
    s_oGame = this;
    
	COMBO_VALUE = oData.combo_value;
	EXTRA_SCORE = oData.extra_score;
	
    this._init();
}

var s_oGame;
var s_oBezier;