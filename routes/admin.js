const express=require('express');
const Sequelize=require('sequelize');
const multer=require('multer');
const path=require('path');
const fs=require('fs');

const {Basket, Buy, Comment, Hashtag, Product, User}=require('../models');
const {isLoggedIn, isNotLoggedIn, isAdmin}=require('./middlewares');

const router=express.Router();

router.use((req, res, next)=>{
	res.locals.user=req.user;
	next();
});

router.get('/', isLoggedIn, isAdmin, async(req, res, next)=>{
	try{
		const products=await Product.findAll({});
		res.render('adminpage/admin', {title:'NodeShoppingMall(Admin)', products})
	}catch(error){
		console.error(error);
		next(error);
	}
});

router.get('/hashtag', isAdmin, async(req, res, next)=>{
	const query=req.query.hashtag;
	if(!query){
		return res.redirect('/');
	}
	try{
		const hashtag=await Hashtag.findOne({where:{title:query}});
		let products=[];
		if(hashtag){
			products=await hashtag.getProducts({});
			console.log('products', products);
		}
		if(!products){
			console.log('nothing');
			const message='검색 결과가 없습니다.'
			res.render('nothing', message);
		}
		return res.render('adminpage/admin',{
			title:`${query} - NodeShoppingMall(Admin)`,
			products:products,
		});
	} catch (error){
		console.error(error);
		next(error);
	}
});

router.get('/product', (req, res)=>{
	res.render('adminpage/admin_product', {title:'Enroll Product - NodeShoppingMall'});
});

router.get('/product/:id', isLoggedIn, isAdmin, async(req, res, next)=>{
	try{
		const product=await Product.findOne({where:req.params.id});
		res.render('product', {title:`${product.name} - NodeShoppingMall(Admin)`, product});
	}catch(error){
		console.error(error);
		next(error);
	}
});

try{
	fs.readdirSync('uploads');
}catch(error){
	console.error('uploads 폴더가 존재하지 않습니다. 폴더를 새로 생성합니다.');
	fs.mkdirSync('uploads');
}

const upload=multer({
	storage:multer.diskStorage({
		destination(req, file, cb){
			cb(null, 'uploads/');
		},
		filename(req, file, cb){
			const ext=path.extname(file.originalname);
			cb(null, path.basename(file.originalname, ext)+new Date().valueOf()+ext);
		},
	}),
	limits:{fileSize:5*1024*1024},
});

router.post('/product', isLoggedIn, isAdmin, upload.single('img'), async(req, res, next)=>{
	try{
		const product=await Product.create({
			name:req.body.name,
			img:req.file.filename,
			price:req.body.price,
			content:req.body.content,
			hashtag:req.body.hashtag,
			remaincount:req.body.count,
		});
		const hashtags=req.body.hashtag.match(/#[^\s#]*/g);
		if(hashtags){
			const result=await Promise.all(
				hashtags.map(tag=>{
					return Hashtag.findOrCreate({
						where:{title:tag.slice(1).toLowerCase()},
					})
				}),
			);
			await product.addHashtags(result.map(r=>r[0]));
		}
		res.redirect('/admin');
	}catch(error){
		console.error(error);
		next(error);
	}
});

router.post('/delete/:id', isLoggedIn, isAdmin, async(req, res, next)=>{
	try{
		const result=await Product.destroy({where:{id:req.params.id}});
		res.redirect('/admin');
	}catch(error){
		console.error(error);
		next(error);
	}
});

router.post('/update/:id', isLoggedIn, isAdmin, async(req, res, next)=>{
	try{
		console.log('test');
		const nowcount=await Product.findOne({
			attributes:['remaincount'],
		},{
			where:{id:req.params.id},
		});
		console.log('nowcount', nowcount);
		nowcount=nowcount+req.body.count;
		await Product.update({
			remaincount:nowcount,
		},{
			where:{id:req.params.id},
		});
		res.redirect('/admin');
	}catch(error){
		console.error(error);
		next(error);
	}
});

router.post('/add/:id', isLoggedIn, isAdmin, async(req, res, next)=>{
	try{
		const nowcount=await Product.findOne({
			attributes:['remaincount'],
		},{
			where:{id:req.params.id},
		});
		await Product.update({
			remaincount:nowcount+req.body.count,
		},{
			where:{id:req.params.id},
		});
		res.redirect('/admin');
	}catch(error){
		console.error(error);
		next(error);
	}
});

router.get('/hashtag', isAdmin, async(req, res, next)=>{
	const query=req.query.hashtag;
	if(!query){
		return res.redirect('/admin');
	}
	try{
		const hashtag=await Hashtag.findOne({where:{title:query}});
		let products=[];
		if(hashtag){
			products=await hashtag.getProducts({});
			console.log('products', products);
		}
		if(!products){
			console.log('nothing');
			const message='검색 결과가 없습니다.'
			res.render('nothing', message);
		}
		return res.render('adminpage/admin',{
			title:`${query}-myShoppingmall`,
			products:products,
		});
	} catch (error){
		console.error(error);
		next(error);
	}
});

module.exports=router;