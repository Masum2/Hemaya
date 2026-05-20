using System.Net.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;
using System.Net;

var builder = WebApplication.CreateBuilder(args);

// ১. সার্ভিস ও CORS কনফিগারেশন রেজিস্ট্রেশন
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:54080") // আপনার Vite ফ্রন্টএন্ড পোর্ট
              .WithOrigins("http://localhost:5205")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // সেশন কুকি পাস করার জন্য আবশ্যক
    });
});

builder.Services.AddRazorPages();
builder.Services.AddSpaStaticFiles(options =>
{
    options.RootPath = "../securityadmin/dist";
});

// HttpClient কনফিগারেশন (যেন এটি নিজস্ব কুকি কন্টেইনার দিয়ে আমাদের কাস্টম কুকি ব্লক না করে)
builder.Services.AddHttpClient("AzureProxy")
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        UseCookies = false, // কাস্টম কুকি পাস করার জন্য এটি অত্যন্ত জরুরি
        AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
    });

var app = builder.Build();

app.UseStaticFiles();
app.UseCors(); // UseRouting এর ঠিক উপরে থাকবে
app.UseRouting();

// ২. রিভার্স প্রক্সি মিডলওয়্যার
app.Use(async (context, next) =>
{
    if (context.Request.Path.Value != null &&
        context.Request.Path.Value.StartsWith("/api", StringComparison.OrdinalIgnoreCase))
    {
        var httpClientFactory = context.RequestServices.GetRequiredService<IHttpClientFactory>();
        var httpClient = httpClientFactory.CreateClient("AzureProxy");

        // লাইভ Azure ইউআরএল তৈরি
        var targetUrl = $"https://pechangatesthemaiya.azurewebsites.net{context.Request.Path}{context.Request.QueryString}";
        var requestMessage = new HttpRequestMessage(new HttpMethod(context.Request.Method), targetUrl);

        // POST/PUT/PATCH রিকোয়েস্টের বডি বা ডাটা কপি করা
        if (context.Request.Method != "GET" && context.Request.Method != "HEAD")
        {
            var streamContent = new StreamContent(context.Request.Body);
            requestMessage.Content = streamContent;
        }

        // ব্রাউজার থেকে আসা হেডারগুলো প্রক্সিতে কপি করা
        foreach (var header in context.Request.Headers)
        {
            if (header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase) ||
                header.Key.Equals("Cookie", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            if (header.Key.StartsWith("Content-", StringComparison.OrdinalIgnoreCase))
            {
                if (requestMessage.Content != null)
                {
                    requestMessage.Content.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }
            else
            {
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        // Azure সার্ভার ট্রাস্টের জন্য হোস্ট হেডার ফিক্স
        requestMessage.Headers.Host = "pechangatesthemaiya.azurewebsites.net";

        // [NEW FRESH COOKIE]: আপনার সদ্য আপডেট হওয়া তাজা কুকি স্ট্রিং
        string freshLiveCookie = "ARRAffinity=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; ARRAffinitySameSite=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; .AspNetCore.Antiforgery.cdV5uW_Ejgc=CfDJ8LbtibfgVHBJjONX366BUVkZtPAoqUdB1owfySWVs4dZl9_Gx3ksj4Z8VyaUhHhH1bpZFUlLEEVLI0dZj2YKlrpz2F714jvmilpH8yJf8RsvNyKK8O14U_CKlcMkHMQv_XQe8-1K4UWDd3RIy8nCLvo; .AspNetCore.Session=CfDJ8LbtibfgVHBJjONX366BUVlxUg5t2oQvqDqrC2sLKLZpX5aeAffbX7Pk6RoP3EAFTOmTXTqa9N8JJUfFAWC3Zq7rEck4YSzYtbxSpK%2BvZ6R9J0eaITabmAHnI63ZVsQlxImsX8pmXe%2Bjhru4f9RwHx5eyO1lbEabXJIgGAcCKxcF; .AspNetCore.Cookies=CfDJ8LbtibfgVHBJjONX366BUVldPCgogJPSyuH7RkTVIPjjnKoo5QioD5qQ_5_LIFd1Ab9iK6Z55myjb9Ai4hvLN3ExXAqfCTSC73NjcruGdG898IUVyds139TzvGiWHkG5l2-dqwEGL-ESikkNQOdV5wsbHlqlWD8HAoPpZmTy6nlazjD7m2SiOU0zTVy-S7r6xL0qlwQYKCnkWpYRtW-2uWl_2WKZOcB5JMcbuh5Xfix00I5p6l3g_a2YRmKkBiB-pI7yxe1baZnXgjP1oCLkX2TaQybtiLSxJG0MNXw3FNUGSaFNP7K-9v8vl5JgTznB_y6TTna4z2cBMxVES2dLJTQvKwcxbDeITO82YQHDwSTheTavvrfcIC6PRT6hrzQjMe4nMbIllltJh_ARiKDJtn7CNMbsZrCkoYfxgLZdkAhysJFwWgBKzGEYKkyZ23Y0p6k6R9TsLIHaJqgtqJSR9mHROREQftj9wMWLOKPUzhsxKKoI1pfaAj_TRIxrbl8igYFQ5BkxKU0RyRLK4sCA4wr8wOwdcjxDv2WkX3Ee3wTnkPQstYt3Bm0PvPLIyh1uyfkL4zlqCMLuzXSK1f5MlIwhbsbpfpd8zmnpymnfsN3JUUYfToaWSU0dfzylksAqCGrWHPDyIHa9KVj1J8C2f_dbxj_YhMwKmpjT_uzQ_EAeVIdqlS0okeJRzaugjrGwWU0BqhBRGSUM-mVyWL5eVDReS02c5s10iVpScYyYKdump6T-MPG86hesvuboINkUURbr_6su6KSrsR0owurPXyh12JXZjj6DCLdqyYUuN87C8AIL584c_7-nduwgo3vWZ2hxayDymvXXsuYoSIJfzVXYbqczZW32CY-l5zuFx8LIvyXzfLdIwRYVGrNnPAuHDdhsDIZ0YrCpcoLa6pSjGRzD9Nxvcbut9YCl7QYSAh9GIkcj3k--Lt4FE0ivPtdxoJTzLaIp76_s9lKWs-Y0FBQyRpLUzjoTaM9xl5dJ-BDIgZCjk1hK1p5zp7uA1PPchWkoz4nwOS3tGyYXO1LpsoAIyKwsuNtBGe5WwydmaGllqvOjvaZBrG87osb2XQoFPFJo_5lrXivWKTQEf9i1tD4AlD-O7SvXfEyEToTQ4EdXtgrFLtsm1czDSVwRNICUWwZruiul_K_NvWsiiNr3RzvQ0dgmzH7e8_bgEVplCZnB3xwhfEOzpPbrvlCZMdfipgiMztVu4OOkvRqfYK4u1o2Jy_bfZOu31aQeWor0JWFRSPQg-FkJcLGet8AWgQ56T--aXfNQ9gWm_RH-pwsv161B-lWa1AV9F-ppKoPPPVuR0ZXd0U4iaeL4bXZ33JnTPNkHmE1FuCC6w19wUGv1UF2RPzSQPdX_gsmIHIpJFfkFj9Y7MrqAihBv4C9Lf539zT47Rvr22_gTAQfFno94pfuAENtFaM7uv8cNbVnq52l-3BoZfq1izDB3KdZ_FO-lieVVQ-g2utn-8Fo-dYgh43-1MAVwy97H-TV86ddsoEDKzX9J2KdH-MgsSkqXQOxI-trw77UDNMHb5aIwzrPGr-sptEJdOC-hRXhu6PVI-EkkrXd-FAgw7S9wY9qIDmVMHTJCwk_Rwx5y82Kj290KFw62zL_WAnIJKikkXeS7zzjJnp5izqvKjxZRGwCA6vgvoq27yI-3krOyiwHa9Uzs5jBLnhxQlMZ_l7Z4VbTOu5RA08nh6SiSBg8_kzmpmPFkuc6Wa87jnl5ixk9_pC5AsE7trrdx8n5YF3OOvm3AaqcuMMg4fexsEEH0tXKbSFu4MeWl7KCOyIw3t2ojBCLSVwnPjIiwZXfL8xjHDuhyeE-syB-cX9ESUUO6MNyKkGC0G1WVWurAhUaLNePl26m1Zk7K9hzykliD91FjkdFyKs3MlCJWVOVDcKKLpIhBRMGHzRFUH80rNn6wZhTXgrQmjEwFT0wH7BTzREt7ROwMnmM28L2n3bu-B-46y-cgF07FuZY89Iq-UFC13enW3Ebk_tdFm7yNR5A6Zo7MP1ITMtKjgRTMi8_PAfgguzBXCifaF7USTPMEJ0mvpFZM3VoGSUgKsPHoIVTCJe4oAb71PMbAYX7KyPltXmoVEqPYPVmnyYYUAeYwh7hiQYXsOVdJcxat7G1fHeDS73dSo7uzYSzi5gKwfik2Ef_TlICVUoR2K2CLmtrIb4L6T-yY0urWPd_piExrPzq9i2uA315s8_tSHzsCksuBU5CUjVucmMVE9-UySLOwAFbehLsFHI5wofD-jbBQTTxDp1zLsciC0ptzADU72s9VlzFALjAMq_5l1ynBjMunDLnQJViw5hfOUIdGmrl6H0rc9y40PYUbr5P9Lqwk6PpJzYy88ueJb4fKtq_N4XO613OpBu4xbAbTsqg";

        requestMessage.Headers.TryAddWithoutValidation("Cookie", freshLiveCookie);

        // Azure লাইভ সার্ভারে রিকোয়েস্ট পাঠানো
        var responseMessage = await httpClient.SendAsync(requestMessage);

        // রেসপন্স স্ট্যাটাস কোড সেট করা
        context.Response.StatusCode = (int)responseMessage.StatusCode;

        // রেসপন্স হেডারগুলো ব্রাউজারে ব্যাক করার জন্য কপি করা
        foreach (var header in responseMessage.Headers)
        {
            if (header.Key.Equals("Transfer-Encoding", StringComparison.OrdinalIgnoreCase) ||
                header.Key.Equals("Connection", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }
            context.Response.Headers[header.Key] = header.Value.ToArray();
        }

        foreach (var header in responseMessage.Content.Headers)
        {
            context.Response.Headers[header.Key] = header.Value.ToArray();
        }

        // চূড়ান্ত ডাটা ব্রাউজারে পুশ করা
        await responseMessage.Content.CopyToAsync(context.Response.Body);
        return;
    }

    await next();
});





app.MapRazorPages();

if (app.Environment.IsDevelopment())
{
    app.UseSpa(spa =>
    {
        spa.Options.SourcePath = "../securityadmin";

        spa.UseProxyToSpaDevelopmentServer("http://localhost:54080");
    });
}

app.MapFallbackToPage("/admin/{**path}", "/Admin");

app.Run();