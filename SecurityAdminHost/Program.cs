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
        string freshLiveCookie = "ARRAffinity=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; ARRAffinitySameSite=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; .AspNetCore.Antiforgery.cdV5uW_Ejgc=CfDJ8LbtibfgVHBJjONX366BUVkZtPAoqUdB1owfySWVs4dZl9_Gx3ksj4Z8VyaUhHhH1bpZFUlLEEVLI0dZj2YKlrpz2F714jvmilpH8yJf8RsvNyKK8O14U_CKlcMkHMQv_XQe8-1K4UWDd3RIy8nCLvo; .AspNetCore.Cookies=CfDJ8LbtibfgVHBJjONX366BUVnzgXgw5rjy5o1OmtdqzUxXMnFGJN-R1T9RVNTA_1s4eIZFNznGHHbRXOzOHx0uMuGxS6SxpJiM4C1anTrnK9_ihvOPq2x7nT8o8HmDRAM1mLHyPwyguqh3Q2XpiNOMJq56K0uluikxeEFDAEo7xim069CySQHIYz8ebvPWAXYLXPqzTu1dX29Ok9uxdgm2U16S0jd-iyITZL3w-Yrzq6KQGUUOrba0IpvaVOSdFmhSaL7eZNaOF8UlEHHVb5eGHjK2tjavrx4STC_LLnDGxUj51VnbHhFkgizcoe8aiqFbv9Q1pg8OYy_jcKwA9pbI9Crvb1kpJpoHrfHP50w6A0pQnixv83Qcm18qbSb1YcSFdFj9dech85RSXo5RCerXFoTO9l3X76FEybMvtYpvepv2QLlwkSTt1uyj4oV4DRjJ9dkfeBk-Ur_cbQXOydkq2bwoeCgbi1r0wZuKiApR-Scjd4vwBioZrk7fgtk_HlawzzcqqgfzGtynycdQRtlkDIMOEBhFyHEIWh7oiiNFC00S_OkkU18L---h8nVpWxO-p0EJs4lYuSQVmqTGzKTFUVgl5cUV-YKYSqqjfL2shE5HA3P3okJYI3iYveRm8smRHm6UefGr2DFobv6e6XYjKVJzyBKS-dWeokTz5Uwsy8DP7o65XAkNcRE0JJUn_b6LZQwY0LH-Tt6_slmIbxubxCS1nhzZIqBhs0XFYruqlWVCrrR1mCzMW6Us5X2VaQoY9OM1U-JGoc_9SKDvIcy6FyvQC9033A5XU1hVoCt1rviaSqnPv6bzncRZciVXVkCrY-uFD09Xy_Y46ABcGY3LtJSLc75hgFgCyzsl3gkRIpDHqMOuh1tOBn007lS-SCxLVqbetjf-mhU7zLPX_immg5KpDqowKx6V4r26aQBI3Y_JR4XFLjY0S_zX1QFbwVzFTzcj68G0wAsJ4W0tMgRD81rEKp4HDktKOg7nLKx024wqK_MHpgzv1_lsRQRtLzJ1vlWHyrJJDRB8p8bqXPEP3flDLmp_2Dtx5mJsViY2wy3Pi2CtpSP4apaxLHxt6LdvYWp_vVyT3GNrtkk5SpSp8EIz9unhgVhJWoRk1dRsYw79j6Nn8f-h4RNaO0E-rhVyEhTWDUto0sW1ci99JHQ3l93VyR5xvtE8KgTIvqI1IcRs80Uu7zCNeuNrRjcA9RZ11ty-q6gUhXxUvjS4ycEGxbmkOaqHEwGXwn8nk-yEjjqrxiiBkuMmr1SugmHEerYmyzTDn6wJHt3py5c4AFhVrnNK4W9Fjjan37EqKDH0xuvzRCUmcZZJ6CT2seUhyP28fEqJsxy0W5Lq-tI-kTPWVKyVpF0U6IDRC0NBgan5J6wTZEUNVap9j0i8n9uKcmPMaTj1mmgbwEzc09Lm-tAMrRT_pL5JvqJS4E-dzEHaQK3NMmKJcNrdr7aYAXS8x4Q9L66FHe12O_O5v90EF3QrPMA1rcuablCrmupKu2sV2N9ndB6CzSTo0LhI7tdsiEWsZZxvT5ObmN4UsMatCbk2kLbB75p5uIDiSJxk-z7D_-kCavAnxHgcBAzqT5zlv6rOQCVUuvCO3qH94fWYwiz4aLF--lTXNR1429tv5cO8H39Pi4cF_H3clJU5w0OVsDWQo6TdijC2mc4g5tyHgkX1rXOiA3Em4LHVCQ273sWZgJkyD737zva1izKK1yK-V-c6Hzpy3yA8TU5qIdLLMYmaFaYQdFL6VApMWQLc4BHMztFtRtJgVi2mvHin6OyamnXraKKzTZ9yAa0I2uCm837lEvJjVNC7K61ZpeI3AoNYQlv__vy6affd5KwpZRp-5cJxMEQTkTXc71k1mbtOo1ubSdx9QhZTCf_HDz3VWFJpzFe-sH4yneKnIm1RG-1c5qGnDhs6BzRKlv3imlz_7ts-g7sH4XDsTqlZ47TkPx2B7WTWeecMxEiZorIXFyt_Rg6uvK838-mdnLyE6fPpV5251SD0EiafvNcJNGN0oShr5h5ezXFogK0P05spSBoSYE_6i9S_9d3aKSCVwJTCaQtx7IDKRNBfjPMXrFggo5sH5KaHWvBj2oOInevK8LcjGCoGU4Lc1dKNZ9nKCqApt-051ky2xE4_Xp4Ev-M7tGjD9j6R6thPQM_JpoCxemCskTMIBXFVWgfdCkXBkfIMo_S2T0gaKq0DS4SzrC8m6GZKZXQrGc7wyDRsVH5FR1GWsm8zQe1L-hDDmEeF6bvYe3vgTXxDgFR4E8cgNU4M-Bl4ShKKlLvDcVkLPQ_NsGzQqfVnWYvt2PP8J_vdgenWqchrrqjGlIgAJdqoQ9J9irbx_Mrlhm7TSOUrQDU_7M0Ew0uI77Do7GC_9fG1wwX8H1oyOg8; .AspNetCore.Session=CfDJ8LbtibfgVHBJjONX366BUVlxUg5t2oQvqDqrC2sLKLZpX5aeAffbX7Pk6RoP3EAFTOmTXTqa9N8JJUfFAWC3Zq7rEck4YSzYtbxSpK%2BvZ6R9J0eaITabmAHnI63ZVsQlxImsX8pmXe%2Bjhru4f9RwHx5eyO1lbEabXJIgGAcCKxcF";

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
app.MapFallbackToPage("/admin/{**path}", "/Admin");
app.Run();