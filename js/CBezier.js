function CBezier(){
    
    var p0;					// STARTING POINT
    var p1;					// BEZIER POINTS
    var p2;					// END POINTS
    var step;					

    var ax;
    var ay;
    var bx;
    var by;

    var A;
    var B;
    var C;

    var total_length;	
    
    this.init = function(oPoint0,oPoint1,oPoint2,iSpeed){
        p0   = oPoint0;
        p1   = oPoint1;
        p2   = oPoint2;

        ax = p0.x - 2 * p1.x + p2.x;
        ay = p0.y - 2 * p1.y + p2.y;
        bx = 2 * p1.x - 2 * p0.x;
        by = 2 * p1.y - 2 * p0.y;

        A = 4*(ax * ax + ay * ay);
        B = 4*(ax * bx + ay * by);
        C = bx * bx + by * by;

        total_length = this._length(1);

        step = Math.floor(total_length / iSpeed);
        if (total_length % iSpeed > iSpeed / 2)	step ++;

        return step;
    };

    this._speed = function(t){
        return Math.sqrt(A * t * t + B * t + C);
    };
    
    this._length = function(t){
        var temp1 = Math.sqrt(C + t * (B + A * t));
        var temp2 = (2 * A * t * temp1 + B *(temp1 - Math.sqrt(C)));
        var temp3 = Math.log(B + 2 * Math.sqrt(A) * Math.sqrt(C));
        var temp4 = Math.log(B + 2 * A * t + 2 * Math.sqrt(A) * temp1);
        var temp5 = 2 * Math.sqrt(A) * temp2;
        var temp6 = (B * B - 4 * A * C) * (temp3 - temp4);

        return (temp5 + temp6) / (8 * Math.pow(A, 1.5));
    };
    
    this.invertL = function(t, l){
        var t1 = t;
        var t2;
        do{
                t2 = t1 - (this._length(t1) - l)/this._speed(t1);
                if (Math.abs(t1-t2) < 0.000001) break;
                t1 = t2;
        }while(true);
        return t2;
    };
    
    this.getAnchorPoint = function(nIndex){
        if (nIndex >= 0 && nIndex <= step){
            var t = nIndex/step;

            var l = t*total_length;

            t = this.invertL(t, l);


            var xx = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
            var yy = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;


            var Q0 = new createjs.Point((1 - t) * p0.x + t * p1.x, (1 - t) * p0.y + t * p1.y);
            var Q1 = new createjs.Point((1 - t) * p1.x + t * p2.x, (1 - t) * p1.y + t * p2.y);

            var dx = Q1.x - Q0.x;
            var dy = Q1.y - Q0.y;
            var radians = Math.atan2(dy, dx);
            var degrees = radians * 180 / Math.PI;

            return new Array(xx, yy, degrees);
        } else{
            return [];
        }
    };
}