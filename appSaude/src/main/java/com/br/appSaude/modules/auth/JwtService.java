package com.br.appSaude.modules.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey secretKey;
    private final long expirationMillis;

    public JwtService(
            @Value("${app.auth.jwt-secret}") String secret,
            @Value("${app.auth.jwt-expiration-ms:3600000}") long expirationMillis
    ) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMillis = expirationMillis;
    }

    public String gerarToken(UsuarioAuth usuario) {
        Date agora = new Date();
        return Jwts.builder()
                .subject(usuario.getId().toString())
                .claim("cpf", usuario.getCpf())
                .claim("perfilId", usuario.getPerfilId())
                .claim("role", usuario.getRole().name())
                .issuedAt(agora)
                .expiration(new Date(agora.getTime() + expirationMillis))
                .signWith(secretKey)
                .compact();
    }

    public Long extrairId(String token) {
        return Long.valueOf(claims(token).getSubject());
    }

    public boolean tokenValido(String token, UsuarioAuth usuario) {
        Claims claims = claims(token);
        return claims.getSubject().equals(usuario.getId().toString())
                && claims.getExpiration().after(new Date());
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(secretKey).build()
                .parseSignedClaims(token).getPayload();
    }
}
