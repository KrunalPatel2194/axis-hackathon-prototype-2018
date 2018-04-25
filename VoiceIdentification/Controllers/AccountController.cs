using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VoiceIdentification.Models;

namespace VoiceIdentification.Controllers
{
    public class AccountController : Controller
    {
        private hackathonEntities db = new hackathonEntities();
        // GET: Account
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Profile()
        {
            if (Session["Id"] != null)
            {
                ViewBag.Id = Session["Id"];
                int Id = (Int32)ViewBag.Id;
                var data = db.Activations.Find(Id);
                if (data.OptedForOnlineTransaction == null)
                {
                    ViewBag.OptedForVerification = false;
                }
                else
                {
                    ViewBag.Verificationid = data.VerificationId;
                    ViewBag.OptedForVerification = true;
                }
                return View();
            }
            else
            {
                return RedirectToAction("Login","Access");
            }
        }
        public JsonResult RecordVerificationIdTodb(Activation activation)
        {
            try
            {
                var data = db.Activations.Find(activation.Id);
                Guid idfid = (Guid)activation.VerificationId;
                var act = db.Activations.Where(x => x.Id == activation.Id).FirstOrDefault();
                int count = db.Activations.Where(x => x.Id == activation.Id).Count();
                if (count > 0)
                {
                    act.VerificationId = idfid;
                    act.OptedForOnlineTransaction = true;
                    db.Entry(act).State = EntityState.Modified;
                    db.SaveChanges();
                    return Json(true);
                }
                else
                {
                    return Json(false);
                }
            }catch(Exception ex)
            {
                return Json(false);
            }
        }
        public ActionResult SpeechToText()
        {
            return View();
        }
    }
}