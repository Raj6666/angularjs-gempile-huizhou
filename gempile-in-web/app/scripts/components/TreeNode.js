export default class TreeNode{
    constructor({id,text,data,icon,children=[],state,type,li_attr,a_attr}){
        // let arg = arguments[0];
        // for (let prop in arg) {
        //     if (arg.hasOwnProperty(prop)&&arg[prop]) {
        //         this[prop] = arg[prop]
        //     }
        // }
        this.id = id;
        this.text = text;
        this.data = data;
        this.icon = icon;
        this.children = children;
        this.state = state;
        this.type = type;
        this.li_attr = li_attr;
        this.a_attr = a_attr;
    }
}