package com.br.appSaude.modules.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UsuarioAuthRepository repository;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioAuthRepository repository) {
        this.jwtService = jwtService;
        this.repository = repository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String token = authorization.substring(7);
                Long accountId = jwtService.extrairId(token);
                UsuarioAuth usuario = repository.findById(accountId).orElse(null);
                if (usuario == null) {
                    log.warn("JWT references an unknown authentication account (id={}, path={}).",
                            accountId, request.getRequestURI());
                } else if (jwtService.tokenValido(token, usuario)) {
                    var authentication = new UsernamePasswordAuthenticationToken(
                            usuario, null, usuario.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    log.warn("JWT is not valid for the authentication account (id={}, path={}).",
                            accountId, request.getRequestURI());
                }
            } catch (RuntimeException exception) {
                log.warn("JWT validation failed (reason={}, path={}).",
                        exception.getClass().getSimpleName(), request.getRequestURI());
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}
