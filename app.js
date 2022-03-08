const express = require('express')
const expressLayout = require('express-ejs-layouts')
const mongoose = require('mongoose')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const ejs = require('ejs')
const Contact = require('./model/contact')
const { body, validationResult, check, Result } = require('express-validator')
const methodOverride = require('method-override')

const app = express()
const port = 3000

// KONFIGURASI MONGOOSE KE DATA LOCAL
mongoose.connect('mongodb://127.0.0.1:27017/ProjectBaru', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
// KONFIGURASI METHOD OVERRIDE
app.use(methodOverride('_method'))
// KONFIGURASI FLASH
app.use(cookieParser('secret'))
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(flash())

// SETUP EJS
app.set('view engine', 'ejs')
app.use(expressLayout)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// HALAMAN HOME --------------------------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    const mahasiswa = [
        {
            nama: 'Rafli',
            email: 'rafli@gmail.com'
        },
        {
            nama: 'diana',
            email: 'diana@gmail.com'
        },
        {
            nama: 'anin',
            email: 'anin@gmail.com'
        }
    ]

    res.render('home', {
        mahasiswa,
        title: 'Home',
        layout: 'part/mainLayout'
    })
})

// HALAMAN ABOUT ------------------------------------------------------------------------------------------------------------------
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About me',
        layout: 'part/mainLayout'
    })
})

// HALAMAN CONTACT ----------------------------------------------------------------------------------------------------------------
app.get('/contact', async (req, res) => {

    const contacts = await Contact.find()


    res.render('contact', {
        title: 'Halaman Contact',
        layout: 'part/MainLayout',
        contacts,
        msg: req.flash('msg')
    })
})

// HALAMAN TAMBAH KONTAK --------------------------------------------------------------------------------------------------------
app.get('/contact/add', (req, res) => {

    res.render('add', {
        title: 'Halaman Tambah Kontak',
        layout: 'part/MainLayout'
    })
})


// PROSES TAMBAH DATA KONTAK ===========================================
app.post('/contact', [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({ nama: value })
        if (duplikat) {
            throw new Error('Nama sudah terdaftar')
        }
        return true
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('nohp', 'No Handphone tidak valid').isMobilePhone('id-ID'),
], (req, res) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {

        res.render('add', {
            title: 'Halaman Tambah Kontak',
            layout: 'part/MainLayout',
            error: error.array()
        })

    } else {
        Contact.insertMany(req.body, (error, result) => {

            req.flash('msg', 'Data berhasil di tambahkan')
            res.redirect('/contact')
        })
    }

})

// PROSES DELETE KONTAK ========================================
app.delete('/contact', (req, res) => {
    Contact.deleteOne({ nama: req.body.nama }).then((result) => {
        req.flash('msg', 'Data berhasil di Hapuss~')
        res.redirect('/contact')
    })
})

// HALAMAN EDIT DATA KONTAK ---------------------------------------------------------------------------------------------------------
app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })

    res.render('edit', {
        title: 'Mengubah data kontak',
        layout: 'part/MainLayout',
        contact
    })
})

// PROSES EDIT =================================================
app.put('/contact', [
    // CHECK APAKAH NAMA VALID ATAU TIDAK
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({ nama: value })
        if (value !== req.body.OldName && duplikat) {
            throw new Error('Nama sudah terdaftar')
        }
        return true
    }),
    // CHECK EMAIL VALID ATAU TIDAK
    check('email', 'Email tidak valid').isEmail(),
    // CHECK NOHP VALID ATAU TIDAK
    check('nohp', 'No Handphone tidak valid').isMobilePhone('id-ID'),
], (req, res) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {

        res.render('edit', {
            title: 'Form Ubah data Kontak',
            layout: 'part/MainLayout',
            error: error.array(),
            contact: req.body
        })
    } else {
        Contact.updateOne(
            { _id: req.body._id },
            {
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp
                }
            }
        ).then((result) => {

            req.flash('msg', 'Data berhasil di Ubah')
            res.redirect('/contact')
        })
    }

})

// HALAMAN DETAIL -------------------------------------------------------------------------------------------------------------------
app.get('/contact/detail:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })


    res.render('detail', {
        title: 'Halaman Detail Contact',
        layout: 'part/MainLayout',
        contact
    })
})

app.listen(port, () => {
    console.log('MongoDB Contact | listening at http://localhost:3000')
})