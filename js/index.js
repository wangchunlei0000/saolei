function Mine(tr, td, mineNum){

    this.tr = tr;               //行数
    this.td = td;               //列数
    this.mineNum = mineNum;     //雷的数量

    this.squares = [];     
    //存储所有方块的信息，二维数组，按行与列顺序，存取都使用行列的形式
    this.tds = [];          //存储所有的单元格的DOM
    this.surplusMine = mineNum;     //剩余雷的数量
    this.allRight = true;      //右击标记的是否全是雷,  判断是否赢了

    this.parent = document.querySelector('.gameBox');


}
//生成 n 个不重复的数字
Mine.prototype.randomNum = function(){
    var square = new Array(this.tr*this.td);    //空数组，长度为所有的格子
    for(var i = 0; i < square.length; i++){
        square[i] = i;
    }
    square.sort(function(){return 0.5-Math.random()});
    // console.log(square.slice(0,this.mineNum));
    return square.slice(0,this.mineNum);
}

Mine.prototype.init = function(){
    // this.randomNum();
    var rn = this.randomNum();    //雷在格子里的位置
    // console.log(rn);
    var n = 0;  //用来找到格子对应的索引
    for(var i = 0; i<this.tr;i++){
        this.squares[i]=[];
        for(var j = 0;j<this.td;j++){
            // n++;
           // this.squares[i][j]=;
           //  取一个方块在数组里的数据，要使用行与列的形式取，找方块周围的方块
           //  要用坐标的方式取，行与列的形式跟坐标的形式（x,y）是刚好相反的
            if(rn.indexOf(n)!=-1){    // 循环到的索引在雷数组里
                this.squares[i][j] = {type:'mine',x:j,y:i};
            }else{
                this.squares[i][j] = {type:'number',x:j,y:i,value:0};
            }
            n++;
        }
    }
    this.updateNum();
    this.createDom();
    this.parent.oncontextmenu = function(){
        return false;       //阻止右键点击的菜单
    }
    //剩余雷数显示
    this.mineNumDom = document.querySelector('.mineNumber');
    this.mineNumDom.innerHTML = this.surplusMine;

}

//创建表格
Mine.prototype.createDom = function(){

    var This = this;

    var table = document.createElement('table');

    for(var i = 0; i < this.tr; i++){
        var domTr = document.createElement('tr');
        this.tds[i] = [];

        for(var j = 0;j < this.td; j++){
            var domTd = document.createElement('td');
            //domTd.innerHTML = 0;

            domTd.pos = [i,j];  //把格子对应的行与列存到格子身上，为了下面通过此值去取数组里对应 的数据

            domTd.onmousedown = function(){

                This.play(event, this);  //这里This指的是实例对象  this指点击的td

            }

            this.tds[i][j] = domTd; //把所有创建的td添加到数组中

          

            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML='';
    this.parent.appendChild(table);
    
}


// 找某个放个周围的八个格子
Mine.prototype.getAround = function(square){

    var x = square.x;
    var y = square.y;
    var result = [];    //找到的格子的坐标返回出去（二维）
    /*
        x-1,y-1   x,y-1    x+1,y-1
        x-1,y     x,y      x+1,y
        x-1,y+1   x,y+1    x+1,y+1
    */

    for(var i = x-1; i <=x+1; i++){
        for(var j = y-1; j <= y+1; j++){
            if(
                i<0||           //左边无格子
                j<0||           //上边无格子
                i>this.td-1||   //右边无
                j>this.tr-1||   //下边
                (i==x && j==y)||    //当前循环到的格子是自己
                this.squares[j][i].type=='mime'     //周围是雷的格子
            ){
                continue;
            }
            result.push([j,i]);     //要以行与列的形式返回出去。
        }
    }

    return result;

};

//更新所有数字

Mine.prototype.updateNum = function(){
    for(var i = 0;i < this.tr; i++){
        for(var j = 0;j < this.td; j++){
            //只更新雷周围的数字
            if(this.squares[i][j].type=='number'){
                continue;
            }
            var num = this.getAround(this.squares[i][j]);
            for(var k=0;k < num.length; k++){
                //周围的雷加1
                this.squares[num[k][0]][num[k][1]].value+=1;
            }
        }
    }
    
    //console.log(this.squares);
}

Mine.prototype.play = function(ev, obj){
    var This = this;

    if(ev.which==1 && obj.className!='flag'){//点击的是左键   限制用户标完小红旗后，就不能左击
        
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero','one','two','three','four','five','six','seven','eight'];

        if(curSquare.type=='number'){
            //点到数字了
            obj.innerHTML = curSquare.value;
            obj.className=cl[curSquare.value];

            if(curSquare.value==0){
                //如果点击的是0
                /**
                 * 1 显示自己
                 * 2 找四周
                 *      3 如果四周的不为0，则停止
                 *      4 如果为0
                 * 
                 */
                obj.innerHTML='';       //不显示
                function getAllZero(square){
                    var around = This.getAround(square);    //找到了周围的n个格子
                    for(var i=0;i<around.length;i++){
                        var x = around[i][0];   //行
                        var y = around[i][1];   //列
                        This.tds[x][y].className = cl[This.squares[x][y].value];

                        if(This.squares[x][y].value==0){
                            //如果找到的格子值为0，则接着调用函数
                            if(!This.tds[x][y].check){
                                //给对应的td添加一个书信个，这条属性代表格子是否被找过，找过则true，下次不找了

                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);
                            }
                            
                        }else{
                            //格子值不为0，那就显示数字
                            This.tds[x][y].innerHTML=This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }

        }else{
            //点到雷
            this.gameOver(obj);
        }


    }
    if(ev.which==3){//  点击的是右键
        // 如果右击的是数字，则不能点击
        if(obj.className && obj.className!='flag'){
            return;
        }
        obj.className = obj.className=='flag'?'':'flag';
        
        // console.log(this.squares[obj.pos[0]][obj.pos[1]].type);
        if(this.squares[obj.pos[0]][obj.pos[1]].type!='mine'){
            this.allRight = false;
        }
        // console.log(this.allRight);

        if(obj.className=='flag'){
            this.mineNumDom.innerHTML = --this.surplusMine;
        }else{
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }

        if(this.surplusMine==0){
            //   剩余的雷的数量为0 表示，用户已经标完小红旗了，要判断游戏成功还是结束
            if(this.allRight==true){
                //  用户全部标对
                alert('successed!');
            }else{
                alert('failed');
                this.gameOver();
            }
        }
        
    }
}


Mine.prototype.gameOver = function(clicktd){
    /**
     * 1 显示所有的雷
     * 2 取消所有格子的点击事件
     * 3 点中的雷标红
     */
    for(var i = 0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type=='mine'){
                this.tds[i][j].className='mine';
                
            }
            this.tds[i][j].onmousedown=null;
        }
    }
    if(clicktd){
        clicktd.style.backgroundColor = 'red';
    }
    // clicktd.style.backgroundColor = 'red';

}

// button的功能

var btns = document.querySelectorAll('.level button');
var mine = null;//存储生成的实例
var ln = 0;    //处理当前选中的状态`
var arr = [ [9,9,10], [16,16,49], [28,28,99] ];  //不同级别的雷数

for(let i =0;i<btns.length-1;i++){
    btns[i].onclick = function(){
        btns[ln].className='';
        this.className = 'active';
        mine = new Mine(...arr[i]);  //=== 9,9,10
        mine.init();

        ln = i;
    }
}

btns[0].onclick();

btns[3].onclick = function(){
    mine.init();
}























