function CMain(oData){

    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    
    var _oData;
    var _oPreloader;
    var _oMenu;
    var _oHelp;
    var _oGame;

    this.initContainer = function(){
        var canvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(canvas);
        createjs.Touch.enable(s_oStage);
        
        s_bMobile = jQuery.browser.mobile;
        if(s_bMobile === false){
            s_oStage.enableMouseOver(20);  
        }
        
        s_oLevelSettings = new CLevelSettings();
        s_iPrevTime = new Date().getTime();

        createjs.Ticker.setFPS(35);

        createjs.Ticker.on("tick",this._update);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }
		
        s_oSpriteLibrary  = new CSpriteLibrary();

        //ADD PRELOADER
        _oPreloader = new CPreloader();

        this._loadImages();
    };

    this.soundLoaded = function(){
         _iCurResource++;

         if(_iCurResource === RESOURCE_TO_LOAD){
             _oPreloader.unload();
            
            this.gotoMenu();
         }
    };
    
    this._initSounds = function(){
         if (!createjs.Sound.initializeDefaultPlugins()) {
             return;
         }
	
        if(navigator.userAgent.indexOf("Opera")>0 || navigator.userAgent.indexOf("OPR")>0){
                createjs.Sound.alternateExtensions = ["mp3"];
                createjs.Sound.addEventListener("fileload", createjs.proxy(this.soundLoaded, this));

                createjs.Sound.registerSound("./sounds/press_but.ogg", "press_but");
                createjs.Sound.registerSound("./sounds/win.ogg", "win");
                createjs.Sound.registerSound("./sounds/game_over.ogg", "game_over");
                createjs.Sound.registerSound("./sounds/combo.ogg", "combo");
                createjs.Sound.registerSound("./sounds/shot.ogg", "shot");
                createjs.Sound.registerSound("./sounds/soundtrack.ogg", "soundtrack");
        }else{
                createjs.Sound.alternateExtensions = ["ogg"];
                createjs.Sound.addEventListener("fileload", createjs.proxy(this.soundLoaded, this));

                createjs.Sound.registerSound("./sounds/press_but.mp3", "press_but");
                createjs.Sound.registerSound("./sounds/win.mp3", "win");
                createjs.Sound.registerSound("./sounds/game_over.mp3", "game_over");
                createjs.Sound.registerSound("./sounds/combo.mp3", "combo");
                createjs.Sound.registerSound("./sounds/shot.mp3", "shot");
                createjs.Sound.registerSound("./sounds/soundtrack.mp3", "soundtrack");
        }
        
        RESOURCE_TO_LOAD += 6;
        
    };
    
    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

        s_oSpriteLibrary.addSprite("but_bg","./sprites/but_play_bg.png");
        s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");
        //s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("bg_menu","./sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("hero","./sprites/hero.png");
        s_oSpriteLibrary.addSprite("hit_area","./sprites/hit_area.png");
        s_oSpriteLibrary.addSprite("explosion","./sprites/explosion.png");
        s_oSpriteLibrary.addSprite("msg_box","./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("extra_score","./sprites/extra_score.png");
        s_oSpriteLibrary.addSprite("end_path","./sprites/end_path.png");
        
        for(var i=0;i<BALL_COLORS;i++){
            s_oSpriteLibrary.addSprite("ball_"+i,"./sprites/ball_"+i+".png");
        }
		
		for(var j=0;j<s_oLevelSettings.getNumLevels();j++){
			s_oSpriteLibrary.addSprite("bg_game_"+(j+1),"./sprites/bg_game_"+(j+1)+".jpg");
		}

        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();

        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;

        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);

        _oPreloader.refreshLoader(iPerc);
        if(_iCurResource === RESOURCE_TO_LOAD){
            _oPreloader.unload();
            
            this.gotoMenu();
        }
    };
    
    this._onAllImagesLoaded = function(){
        
    };
    
    this.onAllPreloaderImagesLoaded = function(){
        this._loadImages();
    };
    
    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };
    
    this.gotoGame = function(){
        _oGame = new CGame(_oData);   
							
        _iState = STATE_GAME;
        $(s_oMain).trigger("game_start");
    };
    
    this.gotoHelp = function(){
        _oHelp = new CHelp();
        _iState = STATE_HELP;
    };
    
    this._update = function(event){
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;
        
        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }
                
        if(_iState === STATE_GAME){
            _oGame.update();
        }
        
        if(s_oStage !== undefined){
            s_oStage.update(event);
        }
    };
    
    s_oMain = this;
    _oData = oData;

    this.initContainer();
}

this.MyTest = function()
{
    drawButterflies();
    function drawButterflies() {
        var imgPath = 'butter.png';
        butterfly1 = new createjs.Bitmap(imgPath);
        butterfly2 = new createjs.Bitmap(imgPath);
        butterfly3 = new createjs.Bitmap(imgPath);
        butterfly2.x = 200;
        butterfly3.x = 400;

        s_oStage.addChild(butterfly1,butterfly2,butterfly3);
        s_oStage.update();
        setTimeout(moveButterfly, 1000);
    }
    function moveButterfly(){
        butterfly2.y += 200;
        s_oStage.update();
    }
}


var s_bMobile;
var s_bAudioActive = true;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;

var s_oSoundtrack;
var s_oDrawLayer;
var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oLevelSettings;