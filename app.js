var express     = require("express"),
expressSanitizer= require("express-sanitizer"),
methodOverride  = require("method-override"),
bodyParser      = require("body-parser"),
mongoose        = require("mongoose"),
app             = express();

// app config
mongoose.connect('mongodb://localhost:27017/blog_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

mongoose.set('useFindAndModify', false);

// Mongoose/model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1594011255798-744f6382496b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//     body: "This is a blog post"
// });

// RESTful routes
app.get("/", function(req, res){
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        }else{
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// CREATE route
app.post("/blogs", function(req, res){
    // create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }else{
            // redirect
            res.redirect("/blogs");
        }
    });
    
});

// SHOW route
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog: foundBlog});
        }
    })
});

// EDIT route
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundBlog});
        }
    })
});

// UPDATE route
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" +req.params.id);
        }
    })
});

// DELETE route
app.delete("/blogs/:id", function(req, res){
    // destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    })
    // redirect
});

app.listen(3000, function(){
    console.log("Server is working");
});